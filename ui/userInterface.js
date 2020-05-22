const React = require('react')
const blessed= require('blessed');
const { render } = require('react-blessed');
const Chart = require('./components/chart');
// Rendering a simple centered box
class App extends React.Component {

  render() {
    const {
      config
    } = this.props;
    return (
      <element>
        <Chart/>
      </element>
    );
  }
}

// Creating our screen
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'Algotia'
});

// Adding a way to quit the program
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Rendering the React app using our screen
module.exports = (props) => {
  render(<App {...props}/>, screen);
}
