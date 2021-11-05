import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const a = 1;
  
  console.log(a);

 /**
  * autoTracker
  *
  * @param {string} id - 订单id
  * @param {string} name - 用户名
  */
  function needTracker(id, name, text) {
    console.log('needTracker====需要埋点1 ', text);
  }

  /**
  * autoTracker
  * 
  * @param {string} id - 订单id
  */
  const needTracker2 = (id) => {
    console.log('needTracker====需要埋点2 ');
  }

  /**
  * autoTracker
  * 
  * @param {string} id - 订单id
  */
  const needTracker3 = function (id) {
    console.log('needTracker====需要埋点3');
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
       <button onClick={() => needTracker('1211116900', '张三2', 'text')}>埋点</button><br/>
       <button onClick={() => needTracker2('12111169', '张三2', 'text')}>埋点1</button><br/>
       <button onClick={() => needTracker3('121111699', '张三2', 'text')}>埋点2</button><br/>
       <TestComponent />
      </header>
    </div>
  );
}

class TestComponent extends React.Component {

  /**
  * autoTracker
  * 
  * @param {string} id - 订单id
  */
  needTracker4(id) {
    console.log('needTracker====需要埋点4');
  }
 
  render() {
    return (
      <div>
        <button onClick={() => this.needTracker4('121690', '张三2', 'text')}>埋点4</button><br/>
      </div>
    );
  }

 }

export default App;
