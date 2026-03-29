import { useEffect, useState } from 'react';
import { createMeeting as createMeetingService, listMeetings as listMeetingsService } from '../services/meetingsService.js';

export function useMeetings(projectId) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadMeetings = async () => {
      try {
        setLoading(true);
        setError('');
        const items = await listMeetingsService(projectId);
        if (isActive) {
          setMeetings(items);
        }
      } catch {
        if (isActive) {
          setError('Besprechungen konnten nicht geladen werden.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadMeetings();

    return () => {
      isActive = false;
    };
  }, [projectId]);

  const createMeeting = async (input) => {
    const newMeeting = await createMeetingService(projectId, input);
    setMeetings((currentMeetings) => [newMeeting, ...currentMeetings]);
    return newMeeting;
  };

  return {
    meetings,
    loading,
    error,
    createMeeting,
  };
}
