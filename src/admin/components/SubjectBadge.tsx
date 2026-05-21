import { SUBJECT_LABELS } from '../constants/subjects';
import type { Subject } from '../constants/subjects';

export function SubjectBadge({ subject }: { subject: string }) {
  const label = SUBJECT_LABELS[subject as Subject] ?? subject;
  return <span className={`subject-badge badge-${subject}`}>{label}</span>;
}
