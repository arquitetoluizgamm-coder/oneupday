# Extractable components

## AppTop
- Source: `components/AppTop.jsx`
- Category: layout
- Description: ONE global top bar with real wordmark and contextual back behavior.
- Extractable props: `showBack`, `backLabel`
- Hardcoded: ONE wordmark position, dimensions and icon treatment.

## BottomNav
- Source: `components/BottomNav.jsx`
- Category: layout
- Description: Floating five-position mobile navigation with central creation control.
- Extractable props: `active`
- Hardcoded: order, SVG paths, avatar position and visual classes.

## CircleSectionTabs
- Source anchor: `components/ProfileTabs.jsx`
- Category: basic
- Description: Horizontal accessible tab row for Circle sections.
- Extractable props: `activeTab`, `showAdmin`
- Hardcoded: ONE tab visual treatment.

## PublicationCard
- Source anchor: `app/home/FeedClient.jsx`
- Category: basic
- Description: Existing ONE feed publication hierarchy with author, journey, media and support actions.
- Extractable props: `privateContext`, `contentType`, `commentsEnabled`, `pinned`
- Hardcoded: media corners, typography, action icons and music treatment.

## PersonRow
- Source anchor: `components/PeopleSearch.jsx`
- Category: basic
- Description: Avatar, name, handle and contextual action.
- Extractable props: `role`, `status`, `actionLabel`
- Hardcoded: avatar geometry and text hierarchy.

## RoutineWizardShell
- Source anchor: `app/rotinas/RoutinesClientComplete.jsx`
- Category: basic
- Description: Progressive multi-step dialog used as creation-flow reference.
- Extractable props: `step`, `totalSteps`, `title`, `canContinue`
- Hardcoded: modal hierarchy and ONE controls.
