import { useState, useRef, useEffect } from "react";
import {
    RiAddFill,
    RiCloseFill,
    RiCheckFill,
} from "@remixicon/react";

type TaglistProps = {
    tags: string[];
    onAdd?: (tag: string) => void;
    onRemove?: (tag: string) => void;
};

function Taglist ({ tags, onAdd, onRemove }: TaglistProps) {
    const [adding, setAdding] = useState(false);
    const [newTag, setNewTag] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
  
    const handleSubmit = () => {
      if (newTag.trim() && onAdd) {
        onAdd(newTag.trim());
        setNewTag("");
        setAdding(false);
      }
    };

    useEffect(() => {
        if (adding && inputRef.current) {
          inputRef.current.focus();
        }
      }, [adding]);

    useEffect(() => {
    if (spanRef.current && inputRef.current) {
        const width = spanRef.current.offsetWidth + 10; // add padding
        inputRef.current.style.width = `${width}px`;
    }
    }, [newTag, adding]);

    return (
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center text-xs text-orange-500 bg-orange-100 h-6 px-2 rounded-md"
            >
              {tag}
              {onRemove && (
                <RiCloseFill
                  className="w-3 h-3 ml-1 mb-0 cursor-pointer"
                  onClick={() => onRemove(tag)}
                />
              )}
            </div>
          ))}
          {adding ? (
            <div className="flex items-center text-xs text-orange-500 bg-orange-100 h-6 px-2 rounded-md">
              <input
                ref={inputRef}
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                  if (e.key === "Escape") {
                    setAdding(false);
                  }
                }}
                className="text-xs placeholder:text-orange-500 bg-transparent border-none outline-none p-0 -mr-1 focus:ring-0"
                placeholder=""
              />
              <RiCheckFill
                className="text-green-400 w-3 h-3 mb-0 cursor-pointer"
                onClick={handleSubmit}
              />
                <span
                    ref={spanRef}
                    className="invisible absolute whitespace-pre text-xs font-normal"
                >
                    {newTag || " "}
                </span>
            </div>
            ) : (
            <RiAddFill
              className="w-5 h-6 text-green-500 cursor-pointer"
              onClick={() => setAdding(true)}
              />
            )}
        </div>
    );
}

export default Taglist;