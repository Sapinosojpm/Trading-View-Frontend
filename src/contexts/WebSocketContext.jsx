import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { wsUri } from '../config.js';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const subscribers = useRef(new Set());
  const isConnecting = useRef(false);
  const shouldConnect = useRef(true);

  const connect = useCallback(() => {
    if (isConnecting.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      isConnecting.current = true;
      console.log('🔌 Attempting WebSocket connection...');
      
      const ws = new WebSocket(wsUri);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        isConnecting.current = false;
        
        // Subscribe to data streams
        ws.send(JSON.stringify({ type: 'subscribe_price' }));
        ws.send(JSON.stringify({ type: 'subscribe_balance' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Notify all subscribers
          subscribers.current.forEach(callback => {
            try {
              callback(data);
            } catch (err) {
              console.error('Error in WebSocket subscriber:', err);
            }
          });
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        isConnecting.current = false;
        
        // Only attempt to reconnect if we should be connected and it's not a normal closure
        if (shouldConnect.current && event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`🔄 Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        isConnecting.current = false;
      };

    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
      isConnecting.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldConnect.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    isConnecting.current = false;
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const subscribe = useCallback((callback) => {
    subscribers.current.add(callback);
    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    shouldConnect.current = true;
    connect();
    
    return () => {
      shouldConnect.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldConnect.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect,
    subscribe
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 