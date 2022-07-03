import 'react-perfect-scrollbar/dist/css/styles.css';
import _ from 'lodash';
import Head from 'next/head';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { io } from 'socket.io-client';
import styled from 'styled-components';
import { getUserByValidSessionToken } from '../../util/database';

const Main = styled.div`
  background-color: red;
`;
const socket = io('http://localhost:3000');

export default function Home(props) {
  const [sendingMessage, setSendingMessage] = useState('');
  const [receievedMessages, setReceievedMessages] = useState([]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [drawing, setDrawing] = useState(0);
  const [players, setPlayers] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false); // state to track when user clicks to draw
  const [firstPlayer, setFirstPlayer] = useState(false);
  const [turn, setTurn] = useState(false);
  // INITALIZE SOCKET AND HANDLING ALL RESPONSES FROM SOCKET IF CONNECTED
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.5;
    canvas.height = window.innerHeight * 0.8;
    canvas.style = `${window.innerWidth}px`;
    canvas.style = `${window.innerHeight}px`;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = 'red';
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL();
    socket.emit('canvas', imgData, props.link.gameId);
    console.log('im drawing');
  };
  function startDrawing({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  }

  const draw = useCallback(
    ({ nativeEvent }) => {
      if (!isDrawing) {
        return;
      }
      const { offsetX, offsetY } = nativeEvent;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    },
    [isDrawing],
  );
  useEffect(() => {
    if (props.user) {
      socket.on('connect', () => {});
      socket.on('status', (data) => {
        console.log(data);
      });

      socket.emit(
        'join-room',
        props.link.gameId,
        props.user.username,
        firstPlayer,
      );
      socket.on('msg', (msg) => {
        setReceievedMessages([...receievedMessages, msg]);
        console.log(receievedMessages);
        console.log('this is the message', msg);
      });
    }
  }, [props.user, props.link]);

  socket.on('firstPlayer', (turn) => {
    setFirstPlayer(turn);
    console.log(turn);
  });
  // useEffect(() => {
  //   socket.on('msg', (msg) => {
  //     setReceievedMessages([...receievedMessages, msg]);
  //     console.log(receievedMessages);
  //     console.log('this is the message', msg);
  //   });
  // }, []);
  useEffect(() => {
    socket.on('room', (user) => {
      setPlayers([...players, user]);
    });
    console.log(players);
  }, [players]);

  useEffect(() => {
    socket.on('canvasData', (canvas) => {
      const canvas1 = canvasRef.current;
      const context = canvas1.getContext('2d');
      const image = new Image();
      image.onload = function () {
        context.drawImage(image, 0, 0);
      };

      image.src = canvas;
    });
  }, [receievedMessages]);
  function dof() {
    socket.emit('message', props.user.username, props.link.gameId);
  }
  function sendState() {
    socket.emit('turnState', firstPlayer, props.link.gameId);
  }
  function sendMessageToChat() {
    setReceievedMessages([
      ...receievedMessages,
      {
        message: sendingMessage,
        username: props.user.username,
        timestamp: new Date(),
      },
    ]);
    socket.emit(
      'message',
      {
        message: sendingMessage,
        username: props.user.username,
        timestamp: new Date(),
      },
      props.link.gameId,
    );
  }
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <input
        placeholder="Type something"
        // value={sendMessageToChat}
        onInput={(e) => setSendingMessage(e.target.value)}
      />
      <button
        onClick={() => {
          sendMessageToChat();
        }}
      >
        send message {sendingMessage}
      </button>
      <button
        onClick={() => {
          dof();
        }}
      >
        send
      </button>
      {firstPlayer ? (
        <button
          onClick={() => {
            sendState();
          }}
        >
          start the game
        </button>
      ) : (
        <div>waiting for first player to start</div>
      )}
      {receievedMessages.map((Chat) => {
        return (
          <div key={Chat.username + ':' + Chat.message + Chat.timestamp}>
            <div>
              {Chat.username}:{Chat.message}
            </div>
          </div>
        );
      })}
      {players.map((player) => {
        return (
          <div key={player}>
            <div>{player}</div>
          </div>
        );
      })}
      <canvas
        onMouseDown={(nativeEvent) => {
          startDrawing(nativeEvent);
        }}
        onMouseUp={(nativeEvent) => {
          finishDrawing(nativeEvent);
        }}
        onMouseMove={draw}
        ref={canvasRef}
      />
      <Main>chat</Main>
    </div>
  );
}
export async function getServerSideProps(context) {
  const user = await getUserByValidSessionToken(
    context.req.cookies.sessionToken,
  );
  const gameUrl = context.query;
  if (user) {
    return {
      props: {
        link: gameUrl,
        user: user,
      },
    };
  }
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}
