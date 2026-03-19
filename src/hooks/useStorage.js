import { useState } from 'react';

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed', e);
  }
}

export function useStorage(key, initialValue) {
  const [value, setValueState] = useState(() => readLS(key, initialValue));

  const setValue = (newVal) => {
    const resolved = typeof newVal === 'function' ? newVal(readLS(key, initialValue)) : newVal;
    writeLS(key, resolved);        // write synchronously FIRST
    setValueState(resolved);       // then update React state
  };

  return [value, setValue];
}

// Helpers for use outside of hooks (e.g. in event handlers before navigation)
export function getStorage(key, fallback) {
  return readLS(key, fallback);
}
export function setStorage(key, value) {
  writeLS(key, value);
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function today() {
  return new Date().toISOString().split('T')[0];
}
