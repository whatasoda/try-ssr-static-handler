import React from 'react';
import styled from 'styled-components';
import { hoge } from './handlers';

const App = () => {
  return (
    <CustomDiv
    // onClick={(e) => {
    //   // eslint-disable-next-line no-console
    //   console.log({ ...e }, e.nativeEvent);
    // }}
    >
      <CustomDiv {...hoge.factory({ some: 'sokosko' })}>
        <CustomDiv
        // onClick={(e) => {
        //   // eslint-disable-next-line no-console
        //   console.log({ ...e }, e.nativeEvent);
        // }}
        >
          <CustomDiv></CustomDiv>
        </CustomDiv>
      </CustomDiv>
    </CustomDiv>
  );
};

const CustomDiv = styled.div`
  width: 80%;
  height: 100px;
  background-color: #0002;
`;

export default App;
