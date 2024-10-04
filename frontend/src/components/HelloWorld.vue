<template>
  <div>
    <h1>Task List</h1>
    <ul>
      <li v-for="task in tasks" :key="task.id">
        {{ task.name }} ({{ task.difficulty }})
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/services/api'; // Import the API client

export default {
  name: 'HelloWorld',
  data() {
    return {
      tasks: [], // Store tasks from the backend
    };
  },
  mounted() {
    // Use the correct function to fetch tasks from the backend
    api
      .get('/tasks')
      .then((response) => {
        this.tasks = response.data; // Set the tasks data
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  },
};
</script>
