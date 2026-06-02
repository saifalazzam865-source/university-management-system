/**
 * Layout components barrel export.
 *
 * Navbar/Footer/SessionProvider are all NAMED exports. The previous barrel
 * referenced a non-existent `default` and a `SessionProviderWrapper` symbol
 * that was never exported — both are corrected here.
 */
export { Navbar }          from './Navbar'
export { Footer }          from './Footer'
export { SessionProvider } from './SessionProvider'
