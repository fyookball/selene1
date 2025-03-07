import { useState } from "react";
import { CheckCircleFilled, EditOutlined } from "@ant-design/icons";

interface EditableProps {
  value: string;
  onConfirm: (string) => void;
  onChange?: (string) => void;
  onBlur?: (string) => void;
  open?: boolean;
  showConfirm?: boolean;
}

export default function Editable({
  value,
  onConfirm = () => {},
  onChange = () => {},
  onBlur = () => {},
  open = false,
  showConfirm = true,
}: EditableProps) {
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(open);
  const [isInputConfirmed, setIsInputConfirmed] = useState(false);
  const [isInputDirty, setIsInputDirty] = useState(false);

  const handleInputChange = (event) => {
    const { value: val } = event.target;

    setIsInputDirty(true);
    setIsInputConfirmed(false);
    setInput(val);
    onChange(val);
  };

  const handleEdit = async () => {
    if (isEditing === true) {
      await onConfirm(input);
      setIsEditing(false);
      setIsInputConfirmed(true);
      setIsInputDirty(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleBlur = async () => {
    await onBlur(input);
  };

  return isEditing ? (
    <div className="flex items-center">
      <input
        type="text"
        className="rounded-lg bg-white text-primary p-1 mx-1 w-full text-center"
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && handleEdit()}
        onBlur={handleBlur}
        value={
          input === value || (input === "" && !isInputDirty) ? value : input
        }
      />
    </div>
  ) : (
    <div className="flex justify-center items-center" onClick={handleEdit}>
      <span className="text-center mx-2">{value}</span>
      {showConfirm && (
        <span className="flex items-center justify-center opacity-90">
          {isInputConfirmed ? (
            <CheckCircleFilled className="text-base text-primary" />
          ) : (
            <EditOutlined className="text-2xl" onClick={handleEdit} />
          )}
        </span>
      )}
    </div>
  );
}
