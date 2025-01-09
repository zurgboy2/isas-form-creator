import { ShowWhenBuilder } from './showWhenBuilder';

const QuestionBuilder = ({ question, onUpdate, onDelete, allQuestions }) => {
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      if (name === 'type') {
        // Initialize options array when switching to select, radio, or checkbox
        const updatedQuestion = {
          ...question,
          type: value,
          options: ['select', 'radio', 'checkbox'].includes(value) 
            ? question.options || [{ label: 'Option 1', value: 'option_1' }]
            : undefined,
          likertOptions: value === 'likert' 
            ? {
                scale: [
                  { value: 1, label: "Strongly Disagree" },
                  { value: 2, label: "Disagree" },
                  { value: 3, label: "Neutral" },
                  { value: 4, label: "Agree" },
                  { value: 5, label: "Strongly Agree" }
                ],
                statements: [{ id: crypto.randomUUID(), text: "" }]
              }
            : undefined
        };
        onUpdate(updatedQuestion);
      } else {
        onUpdate({
          ...question,
          [name]: type === 'checkbox' ? checked : value
        });
      }
    };
  
    const addOption = () => {
      const newOption = {
        label: `Option ${(question.options?.length || 0) + 1}`,
        value: `option_${(question.options?.length || 0) + 1}`
      };
      onUpdate({
        ...question,
        options: [...(question.options || []), newOption]
      });
    };
  
    const updateOption = (index, newLabel) => {
      const newOptions = [...(question.options || [])];
      newOptions[index] = {
        label: newLabel,
        value: newLabel.toLowerCase().replace(/\s+/g, '_')
      };
      onUpdate({
        ...question,
        options: newOptions
      });
    };
  
    const removeOption = (index) => {
      const newOptions = question.options?.filter((_, idx) => idx !== index);
      onUpdate({
        ...question,
        options: newOptions
      });
    };
  
      const addLikertStatement = () => {
        onUpdate({
          ...question,
          likertOptions: {
            ...question.likertOptions,
            statements: [
              ...(question.likertOptions?.statements || []),
              { id: crypto.randomUUID(), text: "" }
            ]
          }
        });
      };
  
      const updateLikertStatement = (index, text) => {
        const newStatements = [...(question.likertOptions?.statements || [])];
        newStatements[index] = { ...newStatements[index], text };
        onUpdate({
          ...question,
          likertOptions: {
            ...question.likertOptions,
            statements: newStatements
          }
        });
      };
  
      const removeLikertStatement = (index) => {
        onUpdate({
          ...question,
          likertOptions: {
            ...question.likertOptions,
            statements: question.likertOptions.statements.filter((_, idx) => idx !== index)
          }
        });
      };

    return (
      <div className="question-builder">
        <select
          name="type"
          value={question.type}
          onChange={handleChange}
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="select">Select</option>
          <option value="radio">Radio</option>
          <option value="checkbox">Checkbox</option>
          <option value="file">File</option>
          <option value="date">Date</option>
          <option value="likert">Likert Scale</option>
        </select>
  
        <input
          type="text"
          name="question"
          placeholder="Question Text"
          value={question.question}
          onChange={handleChange}
        />
  
        <textarea
          name="description"
          placeholder="Question Description"
          value={question.description}
          onChange={handleChange}
        />
  
        <label>
          <input
            type="checkbox"
            name="required"
            checked={question.required}
            onChange={handleChange}
          />
          Required
        </label>
  
        {['select', 'radio', 'checkbox'].includes(question.type) && (
          <div className="options-builder">
            <h4>Options</h4>
            {question.options?.map((option, index) => (
              <div key={index} className="option-item">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button 
                  type="button" 
                  onClick={() => removeOption(index)}
                  className="remove-option-btn"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addOption}>
              Add Option
            </button>
          </div>
        )}
  
      <ShowWhenBuilder 
            showWhen={question.showWhen}
            onChange={(newShowWhen) => {
              onUpdate({
                ...question,
                showWhen: newShowWhen
              });
            }}
            allQuestions={allQuestions}
          />

        {/* Likert Scale Builder */}
        {question.type === 'likert' && (
          <div className="likert-builder">
            <h4>Likert Scale Statements</h4>
            {question.likertOptions?.statements.map((statement, index) => (
              <div key={statement.id} className="likert-statement-item">
                <input
                  type="text"
                  value={statement.text}
                  onChange={(e) => updateLikertStatement(index, e.target.value)}
                  placeholder={`Statement ${index + 1}`}
                />
                <button 
                  type="button" 
                  onClick={() => removeLikertStatement(index)}
                  className="remove-option-btn"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addLikertStatement}>
              Add Statement
            </button>
          </div>
        )}

        <button onClick={onDelete}>Delete Question</button>
      </div>
    );
};

export default QuestionBuilder;