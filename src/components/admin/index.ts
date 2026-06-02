/**
 * Admin components barrel export.
 *
 * Every component in this folder is a NAMED export, so the barrel must
 * re-export named bindings (not `default`). Mismatching these is what caused
 * the "Module has no exported member 'default'" build errors.
 */
export { AdminSidebar }        from './AdminSidebar'
export { AdminTopbar }         from './AdminTopbar'
export { AdminReviewPanel }    from './AdminReviewPanel'
export { AnnouncementsClient } from './AnnouncementsClient'
export { FacultiesClient }     from './FacultiesClient'
export { MessagesClient }      from './MessagesClient'
export { NewsClient }          from './NewsClient'
export { StudentEditForm }     from './StudentEditForm'
export { StudentsToolbar }     from './StudentsToolbar'
