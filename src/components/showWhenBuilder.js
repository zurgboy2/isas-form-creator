import { CONDITION_CODES, MULTI_VALUE_PREFIX, RANGE_PREFIX } from './conditionCodes';
import React, { useState } from 'react';

export const ShowWhenBuilder = ({ showWhen, onChange, allQuestions }) => {
    const [conditionType, setConditionType] = useState('simple'); // simple, multi, range, special
    
    const handleConditionTypeChange = (e) => {
        setConditionType(e.target.value);
        // Reset the equals value when changing condition type
        onChange({
        ...showWhen,
        equals: ''
        });
    };
    
    const handleMultiValueChange = (value) => {
        onChange({
        ...showWhen,
        equals: MULTI_VALUE_PREFIX + value
        });
    };
    
    const handleRangeChange = (min, max) => {
        onChange({
        ...showWhen,
        equals: `${RANGE_PREFIX}${min}-${max}`
        });
    };
    
    return (
        <div className="show-when-builder">
        <h4>Show When (Optional)</h4>
        <select
            name="questionId"
            value={showWhen?.questionId || ""}
            onChange={(e) => onChange({
            ...showWhen,
            questionId: e.target.value
            })}
        >
            <option value="">Always Show</option>
            {allQuestions?.map(q => (
            <option key={q.id} value={q.id}>{q.question}</option>
            ))}
        </select>
    
        {showWhen?.questionId && (
            <>
            <select
                value={conditionType}
                onChange={handleConditionTypeChange}
            >
                <option value="simple">Equals Value</option>
                <option value="multi">Multiple Values</option>
                <option value="range">Numeric Range</option>
                <option value="special">Special Condition</option>
            </select>
    
            {conditionType === 'simple' && (
                <input
                type="text"
                name="equals"
                placeholder="Equals Value"
                value={showWhen?.equals || ""}
                onChange={(e) => onChange({
                    ...showWhen,
                    equals: e.target.value
                })}
                />
            )}
    
            {conditionType === 'multi' && (
                <div className="multi-value-input">
                <input
                    type="text"
                    placeholder="Value1, Value2, Value3"
                    value={showWhen?.equals?.replace(MULTI_VALUE_PREFIX, '') || ""}
                    onChange={(e) => handleMultiValueChange(e.target.value)}
                />
                <small>Separate multiple values with commas</small>
                </div>
            )}
    
            {conditionType === 'range' && (
                <div className="range-input">
                <input
                    type="number"
                    placeholder="Min"
                    onChange={(e) => handleRangeChange(
                    e.target.value,
                    showWhen?.equals?.split('-')[1] || ''
                    )}
                />
                <input
                    type="number"
                    placeholder="Max"
                    onChange={(e) => handleRangeChange(
                    showWhen?.equals?.split('-')[0] || '',
                    e.target.value
                    )}
                />
                </div>
            )}
    
            {conditionType === 'special' && (
                <select
                value={showWhen?.equals || ""}
                onChange={(e) => onChange({
                    ...showWhen,
                    equals: e.target.value
                })}
                >
                <option value={CONDITION_CODES.ANY}>Has Any Value</option>
                <option value={CONDITION_CODES.NONE}>Has No Value</option>
                <option value={CONDITION_CODES.NOT_EMPTY}>Is Not Empty</option>
                <option value={CONDITION_CODES.IS_EMPTY}>Is Empty</option>
                <option value={CONDITION_CODES.TRUE}>Is True/Yes/Checked</option>
                <option value={CONDITION_CODES.FALSE}>Is False/No/Unchecked</option>
                </select>
            )}
            </>
        )}
        </div>
    );
};
