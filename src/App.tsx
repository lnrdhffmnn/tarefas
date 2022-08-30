import cuid from 'cuid';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import './App.scss';

export default function App() {
  interface Task {
    id: string;
    text: string;
    isDone: boolean;
  }

  const [taskList, setTaskList] = useState<Task[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const inputTaskRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dataLoaded) {
      setTaskList(JSON.parse(localStorage.getItem('tasklist') ?? '[]'));
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('tasklist', JSON.stringify(taskList));
    }
  }, [taskList]);

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const taskText = inputTaskRef.current?.value ?? '';

    if (taskText.length < 1) {
      inputTaskRef.current?.focus();
      return;
    }

    const newTask: Task = {
      id: cuid(),
      text: taskText,
      isDone: false,
    };

    setTaskList(_taskList => [newTask, ..._taskList]);
    inputTaskRef.current!.value = '';
  }

  function deleteTask(t: Task) {
    setTaskList(_taskList => _taskList.filter(_task => _task !== t));
  }

  function deleteAllDoneTasks() {
    setTaskList(_taskList => _taskList.filter(_task => !_task.isDone));
  }

  function updateTask(event: ChangeEvent<HTMLInputElement>, t: Task) {
    setTaskList(_taskList =>
      _taskList.map(_task => {
        if (_task === t) {
          _task.isDone = event.target.checked;
        }
        return _task;
      })
    );
  }

  return (
    <div className="app">
      <h1>Tarefas</h1>
      <form onSubmit={createTask}>
        <input
          type="text"
          className="list-item"
          placeholder="Digite algo..."
          ref={inputTaskRef}
        />
        <button type="submit" id="btn-add" className="list-item">
          Adicionar
        </button>
      </form>
      <Reorder.Group as="ul" axis="y" values={taskList} onReorder={setTaskList}>
        {taskList.map(_task => (
          <Reorder.Item
            as="li"
            key={_task.id}
            value={_task}
            className="list-item"
          >
            <div>
              <input
                type="checkbox"
                checked={_task.isDone}
                onChange={event => updateTask(event, _task)}
                title={`Marcar como${_task.isDone ? ' não ' : ' '}concluído`}
              />
              <span className={_task.isDone ? 'done' : ''}>{_task.text}</span>
            </div>
            <button onClick={() => deleteTask(_task)} title="Remover">
              X
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <AnimatePresence>
        {taskList.some(_task => _task.isDone) && (
          <motion.button
            onClick={deleteAllDoneTasks}
            id="btn-del"
            className="list-item"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            Remover concluídos
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
