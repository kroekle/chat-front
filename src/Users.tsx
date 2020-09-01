import React, { useState, useEffect } from 'react';
import './Users.css';
import { GridList, GridListTile } from '@material-ui/core';
import { GrpcClients } from './shared/services/grpc.services';
import { People, Active } from './gen/chat_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import StatusIcon from '@material-ui/icons/FiberManualRecordTwoTone';


interface Props {
  people?: People,
}

export default ({people}: Props) => {

  const ref = React.createRef<HTMLSpanElement>();

  const [myPeople, setMyPeople] = useState<People|undefined>();

  useEffect(() => {

    GrpcClients.chat().getActivePeople(new Empty(), {}, (_err, res) => {
      setMyPeople(res);
    });
  }, [])

  useEffect(() => {
    if (people) {
      setMyPeople(people);
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [people, ref])

  const getIconColor = (status: Active) => {
    switch (status) {
      case Active.ACTIVE:
        return "green";
      case Active.OFF_LINE:
        return "black";
      case Active.IGNORING_YOU:
        return "red";
    }
  }

  return (
    <div className="Body">
      <GridList cols={1} cellHeight={25} className="Name-content">
        {
          myPeople && myPeople.getPersonList().map((person, i) => (
            <GridListTile key={i} cols={1} className="Name-text">
              <StatusIcon fontSize='small' className={getIconColor(person.getActive())}/>

              <span>{person.getName()}</span>
            </GridListTile>
          ))
        }
        <GridListTile key={-1} cols={1} className="Name-text">
          <span className="Name-text" ref={ref}></span>
        </GridListTile>
      </GridList>
    </div>
  );
}

