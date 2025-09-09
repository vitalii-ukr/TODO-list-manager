import { useState, useEffect } from 'react';
import './App.css';
import TodoForm from './features/TodoForm';
import TodoList from './features/TodoList/TodoList';

function App() {
  const [todoList, setTodoList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function getTokenHeader() {
    return `Bearer ${import.meta.env.VITE_PAT}`;
  }

  function getDbUrl() {
    return `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
  }

  function completedTodo(id) {
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isCompleted: true };
      }
      return todo;
    });

    setTodoList(updatedTodos);
  }

  const addTodo = async (newTodo) => {
    const payload = {
      records: [
        {
          fields: {
            title: newTodo.title,
            isCompleted: newTodo.isCompleted,
          },
        },
      ],
    };
    const options = {
      method: 'POST',
      headers: {
        Authorization: getTokenHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    try {
      setIsSaving(true);
      const resp = await fetch(getDbUrl(), options);
      if (!resp.ok) {
        throw new Error(resp.status);
      }

      const { records } = await resp.json();
      const savedTodos = records.map((r) => {
        return {
          id: r.id,
          ...r.fields,
        };
      });
      if (savedTodos.length > 1) {
        throw new Error('DB return more than one saved entities!');
      }
      const savedTodo = savedTodos[0];
      if (!savedTodo.isCompleted) {
        savedTodo.isCompleted = false;
      }

      setTodoList([savedTodo, ...todoList]);
    } catch (error) {
      console.log(error.message);
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  function updateTodo(editedTodo) {
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === editedTodo.id) {
        return editedTodo;
      }
      return todo;
    });

    setTodoList(updatedTodos);
  }

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      const url = getDbUrl();
      const token = getTokenHeader();
      const options = {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      };

      try {
        const resp = await fetch(url, options);
        if (!resp.ok) {
          throw new Error(resp.status);
        }

        const data = await resp.json();

        setTodoList(
          data.records.map((record) => {
            const todoRecord = {
              id: record.id,
              ...record.fields,
            };
            if (!todoRecord.isCompleted) {
              todoRecord.isCompleted = false;
            }
            return todoRecord;
          })
        );
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  return (
    <div>
      <h1>My Todos</h1>
      <TodoForm onAddTodo={addTodo} isSaving={isSaving} />
      {isLoading ? (
        <p>Todo list loading...</p>
      ) : (
        <>
          <TodoList
            todoList={todoList}
            onCompleteTodo={completedTodo}
            onUpdateTodo={updateTodo}
          />
          {errorMessage && (
            <div>
              <hr />
              <p>{errorMessage}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
