const React = require('react');

const stylesheet = {
    bordered: {
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'blue'
        }
      }
    }
  };

class Chart extends React.Component {
    

    render(){
        return(
            <box label='Chart'
            class={stylesheet.bordered}
            width="70%"
            height="70%"
            draggable={true}>

            </box>
        )
    }
}

module.exports = Chart;