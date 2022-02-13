
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import  './popup.css'
import logo from "./logo.jpg";
import Button from 'react-bootstrap/Button';

// const Ps = {
//   background-color: 'black',
//   height: 1000,
//   width: 1000,
// }

class NameForm extends React.Component<{}, { value: string }> {

  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    console.log('erfan was here');
    alert('A name was submitted: ' + this.state.value); //error here
    event.preventDefault();
  }

  render() {
    return (
      <div className='body'>
        <div className='header'>
          <text className = 'gaspricetitle'> ETH Mid Gas Price: </text>
          <br />
          <text className = 'gasprice'>  73 Gwei, $3.84 USD </text>
        </div>

        <form onSubmit={this.handleSubmit}>
          <label>
            <input
              type="text"
              placeholder="Type an address and press enter..."
              value={this.state.value}
              onChange={this.handleChange}
              style={{
                padding: "10px 20px",
                width: "300px",
                textAlign: "left",
                // align: "center",
                border: "0px",
                marginLeft: "25px",
                backgroundColor: '#EDE7E7',
                borderRadius: '10px',
              }}
            />
          </label>
          <img className = 'logo' src = {logo}/>
          <Button variant="primary" type="submit"> Safe List</Button>
        </form>
    </div>
    );
  }
}

function sendForm(){
  //check for validity of link
}


const App: React.FC<{}> = () => {
  return (
      <NameForm/>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)

