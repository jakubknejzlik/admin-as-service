import React from "react";

class DateTimeField extends React.Component {
  static propTypes = {
    // onClear: React.PropTypes.func,
    // readAs: React.PropTypes.oneOf(["DataURL", "ArrayBuffer", "Text"])
  };

  static defaultProps = {
    onClear: () => null
  };

  handleFileSelect() {
    const { dispatch, input, onSelect } = this.props;
    const file = this.fileInput.files[0];

    Promise.resolve()
      .then(() => {
        return onSelect(file);
      })
      .then(result => {
        input.onChange(result);
        this.fileInput.value = "";
      })
      .catch(error => {
        this.fileInput.value = "";
        dispatch(crudl.errorMessage(`Upload failed: ${error}`));
      });
  }

  handleRemoveItem() {
    const newInputValue = this.props.onClear(this.props.input.value);
    this.props.input.onChange(newInputValue);
    this.fileInput.value = "";
  }

  render() {
    const { id, input, disabled, type, readOnly, link, linkURL } = this.props;

    return (
      <div>
        <div
          className="field-button-group field-button-inner"
          id={`autocomplete-${id}`}
        >
          <div className="field">
            <input
              type="text"
              id={`url-input-${id}`}
              autoComplete="off"
              readOnly={true}
              value={input.value}
            />
          </div>
          {input.value && (
            <ul role="group" className="buttons">
              <li>
                <a
                  role="button"
                  aria-label="Open link"
                  className="action-open-in-new icon-only"
                  target="_blank"
                  href={input.value}
                />
              </li>
              <li>
                <button
                  type="button"
                  aria-label="Clear"
                  className="action-clear icon-only"
                  onClick={this.handleRemoveItem.bind(this)}
                >
                  &zwnj;
                </button>
              </li>
            </ul>
          )}
        </div>
        <div className="field">
          <input
            id={id}
            type="file"
            autoComplete="off"
            readOnly={readOnly}
            disabled={disabled}
            onChange={this.handleFileSelect.bind(this)}
            ref={c => {
              this.fileInput = c;
            }}
          />
        </div>
      </div>
    );
  }
}

export default crudl.baseField(DateTimeField);
