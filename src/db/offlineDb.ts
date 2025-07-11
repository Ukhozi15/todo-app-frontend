import Dexie, { type Table } from 'dexie';

// Define la interfaz de la tarea, ahora incluyendo user_id
export interface OfflineTask {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  is_deleted: boolean;
  is_synced: number; // <-- CAMBIO CLAVE: 0 para no sincronizado, 1 para sincronizado
  temp_id?: string;
  created_at?: string;
}

export class AppDexie extends Dexie {
  tasks!: Table<OfflineTask>;

  constructor() {
    super('myTodoAppDb');
    
    // --- CAMBIO CLAVE: Versión incrementada a 6 ---
    // Esto fuerza al navegador a actualizar el esquema con el nuevo tipo de dato.
    this.version(6).stores({
      // 'id' es la clave primaria.
      // 'user_id' y 'is_synced' son ahora índices para búsquedas rápidas.
      tasks: 'id, user_id, temp_id, is_synced',
    });
  }
}

export const db = new AppDexie();
