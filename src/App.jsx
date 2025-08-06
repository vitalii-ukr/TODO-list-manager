import { useState } from 'react';
import './App.css';
import TodoForm from './TodoForm';
import TodoList from './TodoList';

function App() {
  const [todoList, setTodoList] = useState([]);

  function addTodo(title) {
    const newTodo = { title: title, id: Date.now() };
    setTodoList([...todoList, newTodo]);
  }

  return (
    <div>
      <h1>My Todos</h1>
      <TodoForm onAddTodo={addTodo} />
      <TodoList />
    </div>
  );
}

export default App;
