import React, { createContext, useContext, useMemo } from 'react';
import { post } from './api';
import type { LineRef } from '../types';

export interface Actions {
  toggleTask: (ref: LineRef) => void;
  toggleCard: (ref: LineRef) => void;
  moveCard: (ref: LineRef, toColumn: string) => void;
  deleteItem: (ref: LineRef) => void;
  addTask: (input: { text: string; due?: string; tags?: string[] }) => Promise<boolean>;
  addCard: (text: string, column?: string) => Promise<boolean>;
  addEvent: (input: { title: string; date: string; time?: string }) => Promise<boolean>;
  addNote: (input: { title: string; content?: string }) => Promise<boolean>;
}

const noop = () => {};
const noopAsync = async () => false;

const ActionsContext = createContext<Actions>({
  toggleTask: noop,
  toggleCard: noop,
  moveCard: noop,
  deleteItem: noop,
  addTask: noopAsync,
  addCard: noopAsync,
  addEvent: noopAsync,
  addNote: noopAsync
});

export const useActions = () => useContext(ActionsContext);

const pick = ({ file, line, raw }: LineRef) => ({ file, line, raw });

export const ActionsProvider: React.FC<{
  notify: (msg: string, kind?: 'ok' | 'error') => void;
  children: React.ReactNode;
}> = ({ notify, children }) => {
  const actions = useMemo<Actions>(() => {
    /** Ejecuta una escritura; devuelve true si salió bien. El estado nuevo llega por WebSocket. */
    const run = async (url: string, body: unknown, okMsg?: string): Promise<boolean> => {
      try {
        await post(url, body);
        if (okMsg) notify(okMsg, 'ok');
        return true;
      } catch (e) {
        notify(e instanceof Error ? e.message : 'No se pudo guardar', 'error');
        return false;
      }
    };

    return {
      toggleTask: (r) => void run('/api/vault/tasks/toggle', pick(r)),
      toggleCard: (r) => void run('/api/vault/kanban/toggle', pick(r)),
      moveCard: (r, toColumn) => void run('/api/vault/kanban/move', { ...pick(r), toColumn }),
      deleteItem: (r) => void run('/api/vault/delete', pick(r), 'Eliminado'),
      addTask: (i) => run('/api/vault/tasks', i, 'Tarea agregada'),
      addCard: (text, column) => run('/api/vault/kanban/cards', { text, column }, 'Agregado a la bandeja'),
      addEvent: (i) => run('/api/vault/events', i, 'Evento agregado'),
      addNote: (i) => run('/api/vault/notes', i, 'Nota guardada')
    };
  }, [notify]);

  return <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>;
};
