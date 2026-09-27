type AnswerInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function AnswerInput({ label, value, onChange, disabled = false, placeholder = 'Write your answer here...' }: AnswerInputProps) {
  return (
    <div className="answer-entry">
      <label>{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
