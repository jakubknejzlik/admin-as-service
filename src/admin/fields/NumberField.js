import React from "react";

export class NumberField extends React.Component {
  static propTypes = {};

  render() {
    const { id, input, step } = this.props;
    return (
      <div className="field">
        <input
          type="number"
          step={step}
          id={id}
          autoComplete="off"
          {...input}
          data-field-display-name={id}
          data-field-display-values={input.value}
        />
      </div>
    );
  }
}

export default crudl.baseField(NumberField);
