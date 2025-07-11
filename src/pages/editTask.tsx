import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
}

const EditTask: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { task } = location.state as { task: Task };

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    // Get tasks from localStorage
    const storedTasks = localStorage.getItem("tasks");
    const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

    // Update task in the list
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, title, description, status } : t
    );

    // Save updated tasks back to localStorage
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    // Navigate back to dashboard
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Edit Task
        </Typography>
        <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSave}>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <TextField
            fullWidth
            select
            label="Status"
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </TextField>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            type="submit"
          >
            Save Changes
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EditTask;
