import React from "react";
import PropTypes from "prop-types";

const CustomInput = ({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon,
}) => {
  return (
    <div className="mb-3">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="form-label fw-bold">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      {/* Input Group */}
      <div className={`input-group ${icon ? "has-validation" : ""}`}>
        {icon && (
          <span className="input-group-text">
            <i className={icon}></i>
          </span>
        )}
        <input
          type={type}
          name={name}
          id={name}
          className={`form-control ${error ? "is-invalid" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        {/* Validation Error */}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    </div>
  );
};

CustomInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  icon: PropTypes.string, // Example: "bi bi-person" (Bootstrap Icons)
};

export default CustomInput;
