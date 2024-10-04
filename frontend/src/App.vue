<template>
  <div class="container">
    <!-- Left panel for tutorial content -->
    <div class="tutorial-panel">
      <h2>{{ currentTutorial.title }}</h2>
      <p>{{ currentTutorial.description }}</p>
      <h3>Challenge:</h3>
      <p>{{ currentTutorial.challenge }}</p>
      <h4>Example:</h4>
      <pre>{{ currentTutorial.example }}</pre>

      <!-- Navigation buttons to switch between tutorials -->
      <div>
        <button @click="prevTutorial" :disabled="tutorialIndex === 0">
          Previous
        </button>
        <button
          @click="nextTutorial"
          :disabled="tutorialIndex === tutorials.length - 1"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Right panel for interactive shell -->
    <div class="shell-panel">
      <h2>Interactive Shell</h2>
      <textarea
        v-model="userScript"
        placeholder="Write your bash script here..."
      ></textarea>
      <button @click="runScript">Run Script</button>
      <div class="output-panel">
        <p><strong>Output:</strong></p>
        <pre>{{ output }}</pre>
        <div v-html="renderedFeedback"></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // Import axios to make HTTP requests
import { tutorials } from './tutorials.js'; // Import the tutorial data
import './App.css'; // Import the external CSS files
import { marked } from 'marked'; // Import marked for Markdown rendering

export default {
  data() {
    return {
      userScript: '', // This will store the bash script the user types
      output: '', // This will store the output returned from the backend
      feedback: '', // Store success/failure feedback from ChatGPT
      tutorials, // Load all the tutorials
      tutorialIndex: 0, // Index to track which tutorial is being displayed
    };
  },
  computed: {
    // Dynamically fetch the current tutorial based on the tutorialIndex
    currentTutorial() {
      return this.tutorials[this.tutorialIndex];
    }, // Render feedback as Markdown to display code blocks properly
    renderedFeedback() {
      return marked(this.feedback);
    },
  },
  methods: {
    runScript() {
      // Clear previous output and feedback
      this.output = '';
      this.feedback = '';

      // Send the script and the challenge to the backend for validation
      axios
        .post('http://localhost:3000/run-script', {
          script: this.userScript, // Send the user's script
          challenge: this.currentTutorial.challenge, // Send the challenge context to ChatGPT
        })
        .then((response) => {
          // Set the output and feedback returned from the backend
          this.output = response.data.output;
          this.feedback = response.data.feedback;
        })
        .catch((error) => {
          console.error('Error running script:', error);
          this.output = 'Error running script. Please try again.';
        });
    },
    // Method to go to the next tutorial
    nextTutorial() {
      if (this.tutorialIndex < this.tutorials.length - 1) {
        this.tutorialIndex++;
        this.resetShell();
      }
    },
    // Method to go to the previous tutorial
    prevTutorial() {
      if (this.tutorialIndex > 0) {
        this.tutorialIndex--;
        this.resetShell();
      }
    },
    // Reset the shell for each new tutorial
    resetShell() {
      this.userScript = '';
      this.output = '';
      this.feedback = '';
    },
  },
};
</script>
