import { useEffect, useRef, useState } from 'react';

export default function ProtocolActionBar({
  protocolLabelName,
  protocolLabelMeta,
  keyword,
  onKeywordSave,
  isClosed,
  onEndProtocol,
  onClose,
}) {
  const [isEditingKeyword, setIsEditingKeyword] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState(keyword || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditingKeyword) {
      setKeywordDraft(keyword || '');
    }
  }, [keyword, isEditingKeyword]);

  useEffect(() => {
    if (!isEditingKeyword) return;
    const timer = setTimeout(() => {
      try {
        inputRef.current?.focus();
        inputRef.current?.select();
      } catch (_err) {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isEditingKeyword]);

  const saveKeyword = async () => {
    const nextKeyword = String(keywordDraft || '').trim();
    const currentKeyword = String(keyword || '').trim();
    if (nextKeyword === currentKeyword) {
      setIsEditingKeyword(false);
      return;
    }
    try {
      await onKeywordSave?.(nextKeyword);
      setIsEditingKeyword(false);
    } catch (_err) {
      setKeywordDraft(keyword || '');
      setIsEditingKeyword(false);
    }
  };

  const cancelKeywordEdit = () => {
    setKeywordDraft(keyword || '');
    setIsEditingKeyword(false);
  };

  return (
    <div className="protocol-action-bar">
      <div className={isClosed ? 'protocol-action-bar__meta protocol-action-bar__meta--closed' : 'protocol-action-bar__meta'}>
        <div className="protocol-action-bar__label">{protocolLabelName}</div>
        <div className="protocol-action-bar__meta-line">{protocolLabelMeta}</div>
        {isEditingKeyword ? (
          <input
            ref={inputRef}
            className="protocol-action-bar__keyword-input"
            value={keywordDraft}
            onChange={(event) => setKeywordDraft(event.target.value)}
            onBlur={() => {
              void saveKeyword();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void saveKeyword();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                cancelKeywordEdit();
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="protocol-action-bar__keyword-button"
            onClick={() => setIsEditingKeyword(true)}
            title="Schlagwort bearbeiten"
          >
            <span className="protocol-action-bar__keyword-text">{keyword || '\u00A0'}</span>
          </button>
        )}
      </div>

      <div className="protocol-action-bar__actions">
        <button type="button" className="button button--sm button--primary" onClick={onEndProtocol}>
          Protokoll beenden
        </button>
        <button type="button" className="button button--secondary button--sm button--toolbar" onClick={onClose}>
          Schliessen
        </button>
      </div>
    </div>
  );
}
