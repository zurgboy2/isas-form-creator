// components/SectionBuilder.js
import React from 'react';
import QuestionBuilder from './QuestionBuilder';
import { ShowWhenBuilder } from './showWhenBuilder';

const SectionBuilder = ({ section, onUpdate, onDelete, allQuestions }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({
      ...section,
      [name]: value
    });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: crypto.randomUUID(),
      type: "text",
      question: "",
      description: "",
      required: false
    };

    onUpdate({
      ...section,
      questions: [...section.questions, newQuestion]
    });
  };

  return (
    <div className="section-builder">
      <input
        type="text"
        name="title"
        placeholder="Section Title"
        value={section.title}
        onChange={handleChange}
      />
      
      <textarea
        name="description"
        placeholder="Section Description"
        value={section.description}
        onChange={handleChange}
      />
      
      {/* Replace the simple show-when with ShowWhenBuilder */}
      <ShowWhenBuilder 
        showWhen={section.showWhen}
        onChange={(newShowWhen) => {
          onUpdate({
            ...section,
            showWhen: newShowWhen
          });
        }}
        allQuestions={allQuestions}
      />
      
      <div className="questions">
        {section.questions.map((question, index) => (
          <QuestionBuilder
            key={question.id}
            question={question}
            allQuestions={allQuestions}
            onUpdate={(updatedQuestion) => {
              const newQuestions = [...section.questions];
              newQuestions[index] = updatedQuestion;
              onUpdate({
                ...section,
                questions: newQuestions
              });
            }}
            onDelete={() => {
              onUpdate({
                ...section,
                questions: section.questions.filter(q => q.id !== question.id)
              });
            }}
          />
        ))}
        <button onClick={addQuestion}>Add Question</button>
      </div>
      
      <button onClick={onDelete}>Delete Section</button>
    </div>
  );
};

export default SectionBuilder;