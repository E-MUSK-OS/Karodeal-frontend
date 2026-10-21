'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  generateUUID,
  getOrCreateVisitorId,
  getOrCreateSessionId,
  touchSession,
  sendAnalyticsEvent
} from '@/lib/visitorTracker';

const INACTIVITY_TIMEOUT_MS = 60 * 1000; // 60 seconds inactivity timeout
const HEARTBEAT_INTERVAL_MS = 15 * 1000; // 15 seconds heartbeat

export default function VisitorTracker() {
  const pathname = usePathname();

  // State refs persisted across intervals and event listeners
  const currentVisitRef = useRef({
    pageVisitId: null,
    visitorId: null,
    sessionId: null,
    pagePath: null,
    enteredAt: 0,
    lastHeartbeatTime: 0,
    activeMsDelta: 0,
    totalActiveMs: 0,
    lastActiveTickTime: 0,
    lastInteractionTime: 0,
    isActive: true,
    isTabVisible: true
  });

  // Track page visits across client-side route changes
  useEffect(() => {
    // Do not track visits inside admin portal to avoid skewing public analytics
    if (pathname?.startsWith('/admin')) {
      return;
    }

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const pageVisitId = generateUUID();
    const now = Date.now();

    // 1. End any previous visit on route change
    const prev = currentVisitRef.current;
    if (prev.pageVisitId) {
      const finalElapsed = Math.round((now - prev.enteredAt) / 1000);
      const finalActiveDelta = Math.round(prev.activeMsDelta / 1000);
      sendAnalyticsEvent('page-exit', {
        visitorId: prev.visitorId,
        sessionId: prev.sessionId,
        pageVisitId: prev.pageVisitId,
        activeSecondsDelta: finalActiveDelta,
        elapsedSeconds: finalElapsed
      }, true);
    }

    // 2. Initialize new visit state
    currentVisitRef.current = {
      pageVisitId,
      visitorId,
      sessionId,
      pagePath: pathname || '/',
      enteredAt: now,
      lastHeartbeatTime: now,
      activeMsDelta: 0,
      totalActiveMs: 0,
      lastActiveTickTime: now,
      lastInteractionTime: now,
      isActive: true,
      isTabVisible: typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
    };

    // 3. Capture acquisition / campaign / UTM parameters
    let queryParams = {};
    if (typeof window !== 'undefined') {
      try {
        const sp = new URLSearchParams(window.location.search);
        const utm_source = sp.get('utm_source') || sp.get('source') || sp.get('ref') || sp.get('src');
        const utm_medium = sp.get('utm_medium') || sp.get('medium');
        const utm_campaign = sp.get('utm_campaign') || sp.get('campaign');
        const gclid = sp.get('gclid');
        const fbclid = sp.get('fbclid');
        const ttclid = sp.get('ttclid');
        const wa = sp.get('wa');

        if (utm_source || utm_medium || utm_campaign || gclid || fbclid || ttclid || wa) {
          queryParams = { utm_source, utm_medium, utm_campaign, gclid, fbclid, ttclid, wa };
          sessionStorage.setItem('karodeal_traffic_params', JSON.stringify(queryParams));
        } else {
          const cached = sessionStorage.getItem('karodeal_traffic_params');
          if (cached) queryParams = JSON.parse(cached);
        }
      } catch (e) {}
    }

    // 4. Register Session
    sendAnalyticsEvent('session', {
      visitorId,
      sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      queryParams
    });

    // 5. Register Page Enter
    sendAnalyticsEvent('page-enter', {
      visitorId,
      sessionId,
      pageVisitId,
      pagePath: pathname || '/',
      pageTitle: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      queryParams
    });

    // 5. Ticker to accurately accumulate active engagement milliseconds
    const tickInterval = setInterval(() => {
      const state = currentVisitRef.current;
      if (!state.pageVisitId) return;

      const tickNow = Date.now();
      const elapsedSinceTick = tickNow - state.lastActiveTickTime;
      state.lastActiveTickTime = tickNow;

      // Check inactivity (idle for > 60s)
      const isIdle = (tickNow - state.lastInteractionTime) > INACTIVITY_TIMEOUT_MS;
      state.isActive = state.isTabVisible && !isIdle;

      // Only accumulate active time when tab is visible and user is actively interacting
      if (state.isActive) {
        state.activeMsDelta += elapsedSinceTick;
        state.totalActiveMs += elapsedSinceTick;
      }
    }, 1000);

    // 6. Periodic Heartbeat to server
    const heartbeatInterval = setInterval(() => {
      const state = currentVisitRef.current;
      if (!state.pageVisitId) return;

      const hbNow = Date.now();
      const elapsedSeconds = Math.round((hbNow - state.enteredAt) / 1000);
      const activeSecondsDelta = Math.round(state.activeMsDelta / 1000);

      // Reset delta after sending
      state.activeMsDelta = 0;
      state.lastHeartbeatTime = hbNow;
      touchSession();

      sendAnalyticsEvent('heartbeat', {
        visitorId: state.visitorId,
        sessionId: state.sessionId,
        pageVisitId: state.pageVisitId,
        activeSecondsDelta,
        elapsedSeconds,
        isActive: state.isActive
      });
    }, HEARTBEAT_INTERVAL_MS);

    // 7. User interaction listeners (clicks, scrolling, keys, touches)
    let lastThrottledMove = 0;
    const registerInteraction = () => {
      const state = currentVisitRef.current;
      const interNow = Date.now();
      state.lastInteractionTime = interNow;
      if (!state.isActive && state.isTabVisible) {
        state.isActive = true;
      }
    };

    const handleMouseMove = () => {
      const moveNow = Date.now();
      if (moveNow - lastThrottledMove > 3000) {
        lastThrottledMove = moveNow;
        registerInteraction();
      }
    };

    const handleVisibilityChange = () => {
      const state = currentVisitRef.current;
      const isVis = document.visibilityState === 'visible';
      state.isTabVisible = isVis;
      state.lastActiveTickTime = Date.now();

      if (isVis) {
        state.lastInteractionTime = Date.now();
        state.isActive = true;
      } else {
        state.isActive = false;
        // Flush active time delta when hidden
        const flushActiveDelta = Math.round(state.activeMsDelta / 1000);
        const elapsed = Math.round((Date.now() - state.enteredAt) / 1000);
        state.activeMsDelta = 0;
        sendAnalyticsEvent('heartbeat', {
          visitorId: state.visitorId,
          sessionId: state.sessionId,
          pageVisitId: state.pageVisitId,
          activeSecondsDelta: flushActiveDelta,
          elapsedSeconds: elapsed,
          isActive: false
        });
      }
    };

    const handleExit = () => {
      const state = currentVisitRef.current;
      if (!state.pageVisitId) return;

      const exitNow = Date.now();
      const finalElapsed = Math.round((exitNow - state.enteredAt) / 1000);
      const finalActiveDelta = Math.round(state.activeMsDelta / 1000);

      sendAnalyticsEvent('page-exit', {
        visitorId: state.visitorId,
        sessionId: state.sessionId,
        pageVisitId: state.pageVisitId,
        activeSecondsDelta: finalActiveDelta,
        elapsedSeconds: finalElapsed
      }, true);
    };

    window.addEventListener('click', registerInteraction, { passive: true });
    window.addEventListener('scroll', registerInteraction, { passive: true });
    window.addEventListener('keydown', registerInteraction, { passive: true });
    window.addEventListener('touchstart', registerInteraction, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleExit);
    window.addEventListener('beforeunload', handleExit);

    return () => {
      clearInterval(tickInterval);
      clearInterval(heartbeatInterval);
      window.removeEventListener('click', registerInteraction);
      window.removeEventListener('scroll', registerInteraction);
      window.removeEventListener('keydown', registerInteraction);
      window.removeEventListener('touchstart', registerInteraction);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);

      // Send exit on unmount or route transition
      const state = currentVisitRef.current;
      if (state.pageVisitId) {
        const unmountNow = Date.now();
        const finalElapsed = Math.round((unmountNow - state.enteredAt) / 1000);
        const finalActiveDelta = Math.round(state.activeMsDelta / 1000);
        sendAnalyticsEvent('page-exit', {
          visitorId: state.visitorId,
          sessionId: state.sessionId,
          pageVisitId: state.pageVisitId,
          activeSecondsDelta: finalActiveDelta,
          elapsedSeconds: finalElapsed
        }, true);
        state.pageVisitId = null;
      }
    };
  }, [pathname]);

  return null;
}
