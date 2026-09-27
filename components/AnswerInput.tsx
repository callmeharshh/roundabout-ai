type AnswerInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function AnswerInput({ label, value, onChange }: AnswerInputProps) {
  return (
    <div className="answer-entry">
      <label>{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your answer here..."
      />
    </div>
  );
}
