import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TemplateDialogProps {
  onSelectTemplate: (template: {
    html: string;
    css: string;
    js: string;
  }) => void;
}

const templates = [
  {
    id: "blank",
    name: "Blank Project",
    description: "Start with a clean slate",
    html: `<!DOCTYPE html>
<html>
<head>
  <title>My Project</title>
</head>
<body>
  <h1>Hello World!</h1>
  <p>Start coding to see your changes here.</p>
</body>
</html>`,
    css: `body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #0070f3;
}`,
    js: `// Your JavaScript code here
console.log('Hello from JavaScript!');

document.addEventListener('DOMContentLoaded', () => {
  // DOM is ready
});`,
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "Simple landing page template",
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Landing Page</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <header>
    <nav>
      <div class="logo">Brand</div>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Features</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section class="hero">
      <h1>Welcome to Our Platform</h1>
      <p>The easiest way to build beautiful websites</p>
      <button class="cta">Get Started</button>
    </section>
    
    <section class="features">
      <h2>Key Features</h2>
      <div class="feature-grid">
        <div class="feature">
          <h3>Easy to Use</h3>
          <p>Simple and intuitive interface</p>
        </div>
        <div class="feature">
          <h3>Responsive</h3>
          <p>Looks great on any device</p>
        </div>
        <div class="feature">
          <h3>Fast</h3>
          <p>Optimized for performance</p>
        </div>
      </div>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2023 Your Company. All rights reserved.</p>
  </footer>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
}

header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: #0070f3;
}

nav ul {
  display: flex;
  list-style: none;
}

nav li {
  margin-left: 2rem;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

nav a:hover {
  color: #0070f3;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 1rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #0070f3;
}

.hero p {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 2rem;
}

.cta {
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
}

.cta:hover {
  background-color: #005cc5;
}

.features {
  padding: 4rem 1rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.feature h3 {
  margin-bottom: 1rem;
  color: #0070f3;
}

footer {
  background-color: #f9f9f9;
  text-align: center;
  padding: 2rem;
  margin-top: 4rem;
  color: #666;
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
  }
  
  nav ul {
    margin-top: 1rem;
  }
  
  nav li {
    margin-left: 1rem;
    margin-right: 1rem;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1.2rem;
  }
}`,
    js: `document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for navigation links
  document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add click event to CTA button
  const ctaButton = document.querySelector('.cta');
  if (ctaButton) {
    ctaButton.addEventListener('click', () => {
      alert('Thanks for your interest! This is where you would start the signup process.');
    });
  }
});`,
  },
  {
    id: "interactive",
    name: "Interactive Demo",
    description: "Demo with interactive elements",
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Interactive Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div class="container">
    <h1>Interactive Elements</h1>
    
    <section class="demo-section">
      <h2>Color Picker</h2>
      <div class="color-picker">
        <input type="color" id="colorPicker" value="#0070f3">
        <div class="color-display" id="colorDisplay"></div>
      </div>
      <p>Selected color: <span id="colorValue">#0070f3</span></p>
    </section>
    
    <section class="demo-section">
      <h2>Counter</h2>
      <div class="counter">
        <button id="decrementBtn">-</button>
        <span id="counterValue">0</span>
        <button id="incrementBtn">+</button>
      </div>
    </section>
    
    <section class="demo-section">
      <h2>To-Do List</h2>
      <div class="todo-app">
        <div class="todo-input">
          <input type="text" id="todoInput" placeholder="Add a new task...">
          <button id="addTodoBtn">Add</button>
        </div>
        <ul id="todoList" class="todo-list"></ul>
      </div>
    </section>
  </div>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #0070f3;
}

.demo-section {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

h2 {
  margin-bottom: 1.5rem;
  color: #0070f3;
}

/* Color Picker */
.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.color-display {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  background-color: #0070f3;
  transition: background-color 0.3s ease;
}

/* Counter */
.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.counter button {
  background-color: #0070f3;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.counter button:hover {
  background-color: #005cc5;
}

#counterValue {
  font-size: 2rem;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

/* Todo List */
.todo-input {
  display: flex;
  margin-bottom: 1rem;
}

.todo-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.todo-input button {
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 1rem;
}

.todo-input button:hover {
  background-color: #005cc5;
}

.todo-list {
  list-style: none;
}

.todo-list li {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.todo-list li:last-child {
  border-bottom: none;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list li span {
  flex: 1;
}

.todo-list li button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.todo-list li button:hover {
  background-color: #ff1f1f;
}`,
    js: `document.addEventListener('DOMContentLoaded', () => {
  // Color Picker
  const colorPicker = document.getElementById('colorPicker');
  const colorDisplay = document.getElementById('colorDisplay');
  const colorValue = document.getElementById('colorValue');
  
  colorPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    colorDisplay.style.backgroundColor = color;
    colorValue.textContent = color;
  });
  
  // Initialize color display
  colorDisplay.style.backgroundColor = colorPicker.value;
  
  // Counter
  const decrementBtn = document.getElementById('decrementBtn');
  const incrementBtn = document.getElementById('incrementBtn');
  const counterValue = document.getElementById('counterValue');
  
  let count = 0;
  
  decrementBtn.addEventListener('click', () => {
    count--;
    counterValue.textContent = count;
  });
  
  incrementBtn.addEventListener('click', () => {
    count++;
    counterValue.textContent = count;
  });
  
  // Todo List
  const todoInput = document.getElementById('todoInput');
  const addTodoBtn = document.getElementById('addTodoBtn');
  const todoList = document.getElementById('todoList');
  
  addTodoBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;
    
    const li = document.createElement('li');
    
    const span = document.createElement('span');
    span.textContent = text;
    span.addEventListener('click', () => {
      li.classList.toggle('completed');
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      li.remove();
    });
    
    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
    
    todoInput.value = '';
    todoInput.focus();
  }
});`,
  },
];

const TemplateDialog = forwardRef(function TemplateDialog(
  { onSelectTemplate }: TemplateDialogProps,
  ref,
) {
  const [open, setOpen] = useState(false);

  // Expose the openDialog method via ref
  useImperativeHandle(ref, () => ({
    openDialog: () => setOpen(true),
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutTemplate className="h-4 w-4 mr-1" /> Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template to jumpstart your project
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onSelectTemplate(template);
                    setOpen(false);
                  }}
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default TemplateDialog;
