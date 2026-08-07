// Auto-generated: explicit static imports of every migration.
// Vercel's serverless function bundler only compiles files reachable via
// static import/require — app.module.ts's original runtime glob
// (`__dirname + '/migrations/*.ts'`) is invisible to it, so migrations never
// got bundled and `migrationsRun: true` silently ran zero migrations in
// production. This file makes the migration set part of the static import
// graph so it's actually included in the deployed bundle.

import { InitialSchema1743552000000 } from './1743552000000-InitialSchema';
import { AddForeignKeyIndexes1743552001000 } from './1743552001000-AddForeignKeyIndexes';
import { CreateAuditLogs1743552002000 } from './1743552002000-CreateAuditLogs';
import { AddProjectFlags1775167703252 } from './1775167703252-AddProjectFlags';
import { AddProjectStatus1775169229562 } from './1775169229562-AddProjectStatus';
import { AddTwoEmails1775200000000 } from './1775200000000-AddTwoEmails';
import { AddAiUse1775300000000 } from './1775300000000-AddAiUse';
import { ShrinkAiUse1775300001000 } from './1775300001000-ShrinkAiUse';
import { CreateNewsItems1775400000000 } from './1775400000000-CreateNewsItems';
import { AddHackatimeUserId1775500000000 } from './1775500000000-AddHackatimeUserId';
import { CreateProjectReviews1775500001000 } from './1775500001000-CreateProjectReviews';
import { AddProjectHoursOverrides1775500002000 } from './1775500002000-AddProjectHoursOverrides';
import { CreateComments1775600000000 } from './1775600000000-CreateComments';
import { CreateShopItems1775800000000 } from './1775800000000-CreateShopItems';
import { AddShippingEligibility1775900000000 } from './1775900000000-AddShippingEligibility';
import { CreateOrdersAndFulfillment1776000000000 } from './1776000000000-CreateOrdersAndFulfillment';
import { CreateSubmissions1776100000000 } from './1776100000000-CreateSubmissions';
import { AddHcaTokens1776200000000 } from './1776200000000-AddHcaTokens';
import { AddShopDetailedDescription1776300000000 } from './1776300000000-AddShopDetailedDescription';
import { AddUserGender1776400000000 } from './1776400000000-AddUserGender';
import { AddUserAttribution1777000000000 } from './1777000000000-AddUserAttribution';
import { CreateHcbCredentialAndOrderGrant1777000000000 } from './1777000000000-CreateHcbCredentialAndOrderGrant';
import { CreateShopSuggestions1777100000000 } from './1777100000000-CreateShopSuggestions';
import { BackfillProjectOverrideHours1777200000000 } from './1777200000000-BackfillProjectOverrideHours';
import { CreateDevlogs1777300000000 } from './1777300000000-CreateDevlogs';
import { CreateEvents1777300000000 } from './1777300000000-CreateEvents';
import { AddDevlogTitle1777300000100 } from './1777300000100-AddDevlogTitle';
import { RemoveEventLocation1777400000000 } from './1777400000000-RemoveEventLocation';
import { CreateFraudReviews1778000000000 } from './1778000000000-CreateFraudReviews';
import { AddShopItemFeatured1778100000000 } from './1778100000000-AddShopItemFeatured';
import { AddSubmissionReviewerNote1778200000000 } from './1778200000000-AddSubmissionReviewerNote';
import { AddUserIntent1778300000000 } from './1778300000000-AddUserIntent';
import { AddProjectFlagsColumns1779000000000 } from './1779000000000-AddProjectFlagsColumns';
import { AddProjectOtherHcProgram1779100000000 } from './1779100000000-AddProjectOtherHcProgram';
import { AddEventHostedBy1779200000000 } from './1779200000000-AddEventHostedBy';
import { AddReviewerUserNote1779300000000 } from './1779300000000-AddReviewerUserNote';
import { AddProjectReviewHideReviewerName1779400000000 } from './1779400000000-AddProjectReviewHideReviewerName';
import { AddProjectClaimColumns1779500000000 } from './1779500000000-AddProjectClaimColumns';
import { AddUserReviewerMarkers1779500000000 } from './1779500000000-AddUserWatchlisted';
import { AddLookoutSessions1779600000000 } from './1779600000000-AddLookoutSessions';
import { AddDevlogToLookoutSessions1779700000000 } from './1779700000000-AddDevlogToLookoutSessions';
import { AddOrderFulfillmentNote1782600000000 } from './1782600000000-AddOrderFulfillmentNote';
import { AddDevlogReview1782700000000 } from './1782700000000-AddDevlogReview';
import { AddSidekickIntegration1782800000000 } from './1782800000000-AddSidekickIntegration';
import { AddReviewReturnTracking1782900000000 } from './1782900000000-AddReviewReturnTracking';
import { AddProjectIsGolden1783000000000 } from './1783000000000-AddProjectIsGolden';
import { AddShopItemBlackMarket1783100000000 } from './1783100000000-AddShopItemBlackMarket';
import { AddShopItemSuperFeatured1783300000000 } from './1783300000000-AddShopItemSuperFeatured';
import { AddSiloGrantId1783400000000 } from './1783400000000-AddSiloGrantId';
import { ZeroBanLeakedPendingHours1784800000000 } from './1784800000000-ZeroBanLeakedPendingHours';
import { AddReviewGolden1785000000000 } from './1785000000000-AddReviewGolden';
import { AddRegionalShopPrices1785100000000 } from './1785100000000-AddRegionalShopPrices';
import { AddShopItemGrantFields1785200000000 } from './1785200000000-AddShopItemGrantFields';
import { CreateAppSettings1785300000000 } from './1785300000000-CreateAppSettings';
import { AddUserIdentityOverride1785400000000 } from './1785400000000-AddUserIdentityOverride';

export const ALL_MIGRATIONS = [
  InitialSchema1743552000000,
  AddForeignKeyIndexes1743552001000,
  CreateAuditLogs1743552002000,
  AddProjectFlags1775167703252,
  AddProjectStatus1775169229562,
  AddTwoEmails1775200000000,
  AddAiUse1775300000000,
  ShrinkAiUse1775300001000,
  CreateNewsItems1775400000000,
  AddHackatimeUserId1775500000000,
  CreateProjectReviews1775500001000,
  AddProjectHoursOverrides1775500002000,
  CreateComments1775600000000,
  CreateShopItems1775800000000,
  AddShippingEligibility1775900000000,
  CreateOrdersAndFulfillment1776000000000,
  CreateSubmissions1776100000000,
  AddHcaTokens1776200000000,
  AddShopDetailedDescription1776300000000,
  AddUserGender1776400000000,
  AddUserAttribution1777000000000,
  CreateHcbCredentialAndOrderGrant1777000000000,
  CreateShopSuggestions1777100000000,
  BackfillProjectOverrideHours1777200000000,
  CreateDevlogs1777300000000,
  CreateEvents1777300000000,
  AddDevlogTitle1777300000100,
  RemoveEventLocation1777400000000,
  CreateFraudReviews1778000000000,
  AddShopItemFeatured1778100000000,
  AddSubmissionReviewerNote1778200000000,
  AddUserIntent1778300000000,
  AddProjectFlagsColumns1779000000000,
  AddProjectOtherHcProgram1779100000000,
  AddEventHostedBy1779200000000,
  AddReviewerUserNote1779300000000,
  AddProjectReviewHideReviewerName1779400000000,
  AddProjectClaimColumns1779500000000,
  AddUserReviewerMarkers1779500000000,
  AddLookoutSessions1779600000000,
  AddDevlogToLookoutSessions1779700000000,
  AddOrderFulfillmentNote1782600000000,
  AddDevlogReview1782700000000,
  AddSidekickIntegration1782800000000,
  AddReviewReturnTracking1782900000000,
  AddProjectIsGolden1783000000000,
  AddShopItemBlackMarket1783100000000,
  AddShopItemSuperFeatured1783300000000,
  AddSiloGrantId1783400000000,
  ZeroBanLeakedPendingHours1784800000000,
  AddReviewGolden1785000000000,
  AddRegionalShopPrices1785100000000,
  AddShopItemGrantFields1785200000000,
  CreateAppSettings1785300000000,
  AddUserIdentityOverride1785400000000,
];
