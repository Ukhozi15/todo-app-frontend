import React, { useEffect, useState, useCallback } from "react";
import {
  Container, Typography, Button, Box, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Alert, Avatar, Switch, FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import WifiOffIcon from '@mui/icons-material/WifiOff';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { AlertColor } from '@mui/material/Alert';

import { motion } from 'framer-motion';

// CAMBIO CLAVE: Importamos la URL centralizada
import { API_BASE_URL } from '../apiConfig';

// --- OFFLINE-FIRST IMPORTS ---
import { db } from '../db/offlineDb';
import type { OfflineTask } from '../db/offlineDb';
import { v4 as uuidv4 } from 'uuid';
// --- END OFFLINE-FIRST IMPORTS ---

interface Task extends OfflineTask {}

interface DashboardProps {
  toggleColorMode: () => void;
}

// Se elimina la URL hardcodeada de aquí

const Dashboard: React.FC<DashboardProps> = ({ toggleColorMode }) => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Dialog states
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<string>("To Do");

  // Delete confirmation dialog state
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  // User and theme state
  const [loggedInUsername, setLoggedInUsername] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('themeMode') === 'dark');

  // --- UTILITY AND UI FUNCTIONS ---

  const handleOpenSnackbar = useCallback((message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleCloseTaskDialog = useCallback(() => {
    setOpenTaskDialog(false);
    setCurrentTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("To Do");
  }, []);

  const handleCloseDeleteConfirmDialog = useCallback(() => {
    setOpenDeleteConfirmDialog(false);
    setTaskToDelete(null);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    db.tasks.clear();
    navigate("/");
    handleOpenSnackbar("Logged out successfully!", "info");
  }, [navigate, handleOpenSnackbar]);

  const handleToggleTheme = useCallback(() => {
    toggleColorMode();
    setIsDarkMode(prev => !prev);
  }, [toggleColorMode]);


  // --- CORE DATA HANDLING AND SYNCHRONIZATION LOGIC ---

  const fetchAndSetLocalTasks = useCallback(async () => {
    try {
        const localTasks = await db.tasks.toArray();
        setTasks(localTasks);
    } catch (e) {
        console.error("Error reading from local DB:", e);
        handleOpenSnackbar("Could not read local tasks.", "error");
    }
  }, [handleOpenSnackbar]);

  const runSyncProcess = useCallback(async () => {
    if (!navigator.onLine) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const pendingTasks = await db.tasks.where('is_synced').equals(0).toArray();
    if (pendingTasks.length === 0) return;

    for (const task of pendingTasks) {
        try {
            if (task.is_deleted) {
                if (task.temp_id) {
                    await db.tasks.delete(task.id);
                } else {
                    const response = await fetch(`${API_BASE_URL}/api/tasks/${task.id}`, { method: 'DELETE', headers });
                    if (response.ok || response.status === 404) await db.tasks.delete(task.id);
                }
            } else if (task.temp_id) {
                const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ title: task.title, description: task.description, status: task.status, user_id: task.user_id })
                });
                if (response.ok) {
                    const serverTask = await response.json();
                    await db.transaction('rw', db.tasks, async () => {
                        await db.tasks.delete(task.id);
                        await db.tasks.add({ ...serverTask, is_synced: 1 });
                    });
                }
            } else {
                const response = await fetch(`${API_BASE_URL}/api/tasks/${task.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ title: task.title, description: task.description, status: task.status })
                });
                if (response.ok) await db.tasks.update(task.id, { is_synced: 1 });
            }
        } catch (e) { console.error(`Failed to sync task ${task.id}:`, e); }
    }
  }, []);
  
  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    handleOpenSnackbar("Synchronizing tasks...", "info");
    await runSyncProcess();
    await fetchAndSetLocalTasks();
    handleOpenSnackbar("Synchronization complete!", "success");
    setIsSyncing(false);
  }, [isSyncing, runSyncProcess, fetchAndSetLocalTasks, handleOpenSnackbar]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        navigate('/');
        setLoading(false);
        return;
    }
    
    if (navigator.onLine) {
        try {
            // CAMBIO CLAVE: Se usa la URL de la API para las tareas
            const response = await fetch(`${API_BASE_URL}/api/tasks`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const serverTasks = await response.json();
            await db.transaction('rw', db.tasks, async () => {
                const pendingChanges = await db.tasks.where('is_synced').equals(0).toArray();
                await db.tasks.clear();
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userTasks = serverTasks.filter((task: any) => task.user_id === user.id);
                await db.tasks.bulkPut(userTasks.map(t => ({...t, is_synced: 1})));
                await db.tasks.bulkPut(pendingChanges);
            });
            await runSyncProcess(); 
        } catch (e) {
            console.error("Could not fetch from server:", e);
            handleOpenSnackbar("Couldn't connect to server. Using local data.", "info");
        }
    }

    await fetchAndSetLocalTasks();
    setLoading(false);
  }, [navigate, handleOpenSnackbar, fetchAndSetLocalTasks, runSyncProcess]);

  // --- CRUD OPERATIONS (OPTIMISTIC UI) ---

  const createTask = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        handleOpenSnackbar("User not found. Cannot create task.", "error");
        return;
    }
    const newTask: Task = {
        id: Date.now(),
        user_id: user.id,
        temp_id: uuidv4(),
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        is_deleted: false,
        is_synced: 0
    };
    await db.tasks.add(newTask);
    setTasks(prev => [...prev, newTask]);
    handleCloseTaskDialog();
    handleOpenSnackbar("Task added offline. Will sync when online.", "info");
    handleSync();
  }, [taskTitle, taskDescription, taskStatus, handleCloseTaskDialog, handleOpenSnackbar, handleSync]);

  const updateTask = useCallback(async () => {
    if (!currentTask) return;
    
    const updatedData = {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        is_synced: 0
    };
    await db.tasks.update(currentTask.id, updatedData);
    setTasks(prev => prev.map(t => t.id === currentTask.id ? {...t, ...updatedData} : t));
    handleCloseTaskDialog();
    handleOpenSnackbar("Task updated offline. Will sync when online.", "info");
    handleSync();
  }, [currentTask, taskTitle, taskDescription, taskStatus, handleCloseTaskDialog, handleOpenSnackbar, handleSync]);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!taskToDelete) return;

    if (taskToDelete.temp_id) {
        await db.tasks.delete(taskToDelete.id);
    } else {
        await db.tasks.update(taskToDelete.id, { is_deleted: true, is_synced: 0 });
    }

    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    handleCloseDeleteConfirmDialog();
    handleOpenSnackbar("Task removed. Will sync deletion.", "info");
    handleSync();
  }, [taskToDelete, handleCloseDeleteConfirmDialog, handleOpenSnackbar, handleSync]);

  // --- DIALOG OPEN HANDLERS ---

  const handleOpenAddDialog = useCallback(() => {
    setCurrentTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("To Do");
    setOpenTaskDialog(true);
  }, []);

  const handleOpenEditDialog = useCallback((task: Task) => {
    setCurrentTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskStatus(task.status);
    setOpenTaskDialog(true);
  }, []);
  
  const confirmDeleteTask = useCallback((task: Task) => {
    setTaskToDelete(task);
    setOpenDeleteConfirmDialog(true);
  }, []);

  const handleSubmitDialog = useCallback(() => {
    if (taskTitle.trim() === "") {
      handleOpenSnackbar("Task title cannot be empty!", "warning");
      return;
    }
    currentTask ? updateTask() : createTask();
  }, [taskTitle, currentTask, updateTask, createTask, handleOpenSnackbar]);

  // --- EFFECT HOOKS ---
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) setLoggedInUsername(JSON.parse(userString).username || "");
    fetchInitialData();

    const handleOnline = () => {
        setIsOnline(true);
        handleOpenSnackbar("You are back online!", "success");
        handleSync();
    };
    const handleOffline = () => {
        setIsOnline(false);
        handleOpenSnackbar("You are offline. Changes will be saved locally.", "warning");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [fetchInitialData, handleSync, handleOpenSnackbar]);


  // --- RENDER LOGIC ---
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const displayTasks = tasks.filter(task => !task.is_deleted);
  const activeTasks = displayTasks.filter(task => task.status !== 'Completed');
  const completedTasks = displayTasks.filter(task => task.status === 'Completed');

  return (
    <Container maxWidth="lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {!isOnline && (
            <Alert severity="warning" icon={<WifiOffIcon />} sx={{ mt: 2, mb: 2 }}>
                You are currently offline. Your changes will be saved locally and synced when you're back online.
            </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 4, mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            {loggedInUsername && <Avatar sx={{ bgcolor: stringToColor(loggedInUsername), width: 56, height: 56 }}>{loggedInUsername.charAt(0).toUpperCase()}</Avatar>}
            <Typography variant="h4">Welcome, {loggedInUsername || 'Guest'}!</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControlLabel control={<Switch checked={isDarkMode} onChange={handleToggleTheme} />} label={isDarkMode ? "Dark" : "Light"} />
            <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<AddIcon />}>Add Task</Button>
            <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
          </Box>
        </Box>

        {loading ? <Box display="flex" justifyContent="center" sx={{ my: 4 }}><CircularProgress /></Box> :
        (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Active Tasks</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeTasks.length > 0 ? activeTasks.map(task => (
                      <TableRow key={task.id} sx={{ opacity: task.is_synced === 0 ? 0.6 : 1 }}>
                        <TableCell>
                          {task.title}
                          {task.is_synced === 0 && <Tooltip title="Pending sync"><CircularProgress size={16} sx={{ ml: 1 }} /></Tooltip>}
                        </TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenEditDialog(task)}><EditIcon /></IconButton>
                          <IconButton onClick={() => confirmDeleteTask(task)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4}>No active tasks.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Completed Tasks</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completedTasks.length > 0 ? completedTasks.map(task => (
                      <TableRow key={task.id} sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenEditDialog(task)}><EditIcon /></IconButton>
                          <IconButton onClick={() => confirmDeleteTask(task)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4}>No completed tasks.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} fullWidth maxWidth="sm">
        <DialogTitle>{currentTask ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Task Title" type="text" fullWidth value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
          <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={3} value={taskDescription} onChange={e => setTaskDescription(e.target.value)} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={taskStatus} label="Status" onChange={e => setTaskStatus(e.target.value)}>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button onClick={handleSubmitDialog} variant="contained">{currentTask ? "Save" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteConfirmDialog} onClose={handleCloseDeleteConfirmDialog} maxWidth="xs">
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this task?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
