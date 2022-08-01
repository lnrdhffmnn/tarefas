import { FormEvent, useEffect, useRef, useState } from "react";
import { Button, Center, Checkbox, Flex, Heading, HStack, IconButton, Input, List, ListItem, ScaleFade, SlideFade, Spacer, Text, Tooltip, useBreakpointValue, useToast } from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import cuid from "cuid";

export default function App() {
  interface Task {
    id: string;
    content: string;
    done: boolean;
  }

  const [taskList, setTaskList] = useState<Task[]>([]);
  const [afterInit, setAfterInit] = useState(false);

  const inputTaskRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  useEffect(() => {
    setTaskList(JSON.parse(localStorage.getItem("tasks") ?? "[]"));
    setAfterInit(true);
  }, []);

  useEffect(() => {
    if (afterInit)
      localStorage.setItem("tasks", JSON.stringify(taskList));
  }, [taskList, afterInit]);

  function addNewTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!inputTaskRef.current?.value) {
      inputTaskRef.current?.focus();
      return;
    }

    let newTask: Task = {
      id: cuid(),
      content: inputTaskRef.current!.value,
      done: false
    };

    setTaskList(_state => [newTask, ..._state]);
    inputTaskRef.current.value = "";
  }

  function removeTask(t: Task) {
    setTaskList(_state => _state.filter(_task => _task !== t));
  }

  function removeAllDoneTasks() {
    setTaskList(_state => _state.filter(_task => !_task.done));
    toast({
      title: "Tarefas removidas com sucesso",
      status: "success",
      duration: 3000,
      isClosable: true
    });
  }

  function updateTaskState(t: Task) {
    setTaskList(_state => _state.map(_task => {
      if (_task === t)
        _task.done = !_task.done;
      return _task;
    }));
  }

  return (
    <Center p={5}>
      <Flex flexDir="column" w="100%" maxW={1000}>
        <Heading as="h1">Tarefas</Heading>
        <form onSubmit={addNewTask}>
          <HStack mt={5}>
            <Input type="text" placeholder="Digite algo..." ref={inputTaskRef} borderColor="gray.300" />
            {useBreakpointValue({
              base: <Tooltip label="Adicionar" hasArrow bgColor="teal">
                <IconButton type="submit" aria-label="Adicionar" colorScheme="teal" icon={<AddIcon />} />
              </Tooltip>,
              md: <Button type="submit" colorScheme="teal" leftIcon={<AddIcon />}>Adicionar</Button>
            })}
          </HStack>
        </form>
        {taskList.length < 1
          ? <SlideFade in>
            <Heading m={5}>👆</Heading>
          </SlideFade>
          : <>
            <List spacing={3} mt={5}>
              {taskList.map(_task => (
                <ListItem key={_task.id} bgColor="gray.100" borderRadius={5} borderColor="gray.300" borderWidth={1} p={3} pl={5}>
                  <SlideFade in>
                    <Flex>
                      <Checkbox isChecked={_task.done} onChange={() => updateTaskState(_task)} colorScheme="teal" borderColor="gray.300" mr={2} />
                      <Text style={_task.done ? { opacity: .6, textDecorationLine: "line-through", transitionDuration: ".3s" } : { transitionDuration: ".3s" }}>
                        {_task.content}
                      </Text>
                      <Spacer />
                      <Tooltip label="Remover" hasArrow bgColor="red.500">
                        <IconButton
                          aria-label="Remover"
                          colorScheme="red"
                          variant="link"
                          icon={<DeleteIcon />}
                          onClick={() => removeTask(_task)}
                        />
                      </Tooltip>
                    </Flex>
                  </SlideFade>
                </ListItem>
              ))}
            </List>
            {taskList.some(_task => _task.done) &&
              <ScaleFade in>
                <Button colorScheme="red" leftIcon={<DeleteIcon />} onClick={removeAllDoneTasks} mt={5}>Remover concluídos</Button>
              </ScaleFade>
            }
          </>
        }
      </Flex>
    </Center>
  );
}