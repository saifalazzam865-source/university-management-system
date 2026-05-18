/**
 * Models barrel export.
 * Import models from here: import { UserModel, ApplicationModel } from '@/models'
 */
export { UserModel }         from './User'
export { ApplicationModel }  from './Application'
export { FacultyModel }      from './Faculty'
export { NewsModel }         from './News'
export { AnnouncementModel } from './Announcement'
export { ContactModel }      from './Contact'

export type { IUserDocument }        from './User'
export type { IApplicationDocument, IUploadedDoc, ITimelineEvent } from './Application'
export type { IFacultyDocument }     from './Faculty'
export type { INewsDocument }        from './News'
export type { IAnnouncementDocument }from './Announcement'
export type { IContactDocument }     from './Contact'
