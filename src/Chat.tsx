import React, { useState, useEffect } from 'react';
import './Chat.css';
import { TextField, GridList, GridListTile, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { GrpcClients } from './shared/services/grpc.services';
import { Register, Person, Active, Message, People } from './gen/chat_pb';

interface Props {
  setPeople: (people:People) => void, 
}

export default ({setPeople}:Props) => {

  const [text, setText] = useState<string>("");
  const [myName, setMyName] = useState("");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("ACTIVE");
  const ref = React.createRef<HTMLSpanElement>();
  const nameRef = React.createRef<HTMLInputElement>();

  useEffect(() => {
    if (myName) {
      const person = new Person();
      person.setName(myName);
      person.setActive(Active.ACTIVE);
      const reg = new Register();
      reg.setPerson(person);
      const stream = GrpcClients.chat().registerAndStream(reg, {});
      stream.on('error', (err) => {
        // TODO: likely want to restart the stream (with some sort of incremental backoff)
        console.log(`error called: ${err.message}`);
      });
      stream.on('data', (res) => {
        if (res.hasText()) {
          setMessages((messages) => {
            const ms = messages.slice();
            ms.unshift(res.getText()!);
            return ms;
          });
        } else if (res.hasPeople()) {
          setPeople(res.getPeople()!);
        }
      });
      return () => {
        console.log('going out');
        stream.cancel();
        const person = new Person();
        person.setName(myName);
        person.setActive(Active.OFF_LINE);
        GrpcClients.chat().changeStatus(person, {}, () => {});
      }
    }
  }, [myName, setPeople])

  useEffect(() => {
    if (status && myName) {
      const person = new Person();
      person.setName(myName);
      switch (status) {
        case "OFF_LINE":
          person.setActive(Active.OFF_LINE);
          break;
        case "ACTIVE":
          person.setActive(Active.ACTIVE);
          break;
        case "IGNORING_YOU":
          person.setActive(Active.IGNORING_YOU);
          break;
      }
      GrpcClients.chat().changeStatus(person, {}, () => {});
    }
  }, [status, myName])

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.indexOf('\n') > -1) {

      const sender = new Person();
      sender.setName(myName);
      const message = new Message();
      message.setSender(sender);
      message.setText(text);
      GrpcClients.chat().sendMessage(message, {}, () => {});
      setText("");
    } else {
      setText(event.target.value);
    }
  }

  return (
    <div className="Body">
      <TextField
        multiline
        disabled={name===""}
        value={text}
        onChange={handleChange} 
        className="Text-input" 
        label="What's on your mind" />
      <GridList cols={1} cellHeight={20} className="Message-content">
        {
          messages.map((message, i) => (
            <GridListTile key={i} cols={1} className="Message-text">
              <span className="Message-name">{message.getSender()?.getName()}:</span><span>{message.getText()}</span>
            </GridListTile>
          ))
        }
        <GridListTile key={-1} cols={1} className="Message-text">
          <span ref={ref}></span>
        </GridListTile>
      </GridList>
      <div className="Content-header">
        <FormControl className="Header-field">
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            value={status}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => setStatus(event.target.value as string)}
          >
            {Object.keys(Active).map((status, i) => (
              <MenuItem key={i} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>  
        <TextField
          className="Text-name Header-field"
          value={name}
          autoFocus
          ref={nameRef}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event?.target.value)}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => setMyName(name)}
          label="Who are you"/>
      </div>
    </div>
  );
}

