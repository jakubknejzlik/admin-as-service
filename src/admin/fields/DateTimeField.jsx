import React from "react";
// import DateTime from "react-datetime";
// import DatePicker from "react-datepicker";
// import DateTimePicker from "react-widgets/lib/DateTimePicker";

class DateTimeField extends React.Component {
  static propTypes = {
    // getTime: React.PropTypes.func.isRequired,
    // getDate: React.PropTypes.func.isRequired
  };

  render() {
    const { id, input, disabled } = this.props;

    return (
      // <DateTimePicker />
      <div className="field">
        <input
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
