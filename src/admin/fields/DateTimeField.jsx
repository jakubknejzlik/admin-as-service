import React from "react";
// import DateTime from "react-datetime";
import DatePicker from "react-datepicker";

class DateTimeField extends React.Component {
  static propTypes = {
    // getTime: React.PropTypes.func.isRequired,
    // getDate: React.PropTypes.func.isRequired
  };

  render() {
    const { id, input, disabled } = this.props;
    console.log(input);
    return (
      <div className="field">
        <DatePicker
          id={id}
          type="date"
          autoComplete="off"
          readOnly={false}
          {...input}
          disabled={disabled}
        />
      </div>
    );
  }
}

export default crudl.baseField(DateTimeField);
