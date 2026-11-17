const test = require('node:test');
const assert = require('node:assert/strict');
const Registry = require('../company-registry-2025.js');
const Data = require('../cluster-data.js');
require('../cluster-i18n.js');
const Geography = require('../industrial-geography.js');

test('the full supplied table is retained with exact totals, null cells and reported zeros', () => {
  assert.equal(Registry.records.length, 53);
  assert.equal(new Set(Registry.records.map(row => row.id)).size, 53);
  assert.equal(Registry.records.reduce((sum, row) => sum + (row.verifiedEmissions2025T ?? 0), 0), 6492639);
  assert.equal(Registry.records.reduce((sum, row) => sum + row.freeAllowances2025Eua, 0), 5718361);
  assert.deepEqual(Registry.records.filter(row => row.verifiedEmissions2025T === null).map(row => row.id), [
    'industrial-solutions', 'polysan', 'tamara-2009', 'belovo-paper', 'keram-invest', 'nikom-97',
  ]);
  assert.equal(Registry.records.filter(row => row.verifiedEmissions2025T === 0).length, 6);
  const plovdiv = Registry.records.find(row => row.id === 'ba-glass-plovdiv');
  const sofia = Registry.records.find(row => row.id === 'ba-glass-sofia');
  assert.deepEqual([plovdiv.verifiedEmissions2025T, plovdiv.freeAllowances2025Eua], [104645, 76129]);
  assert.deepEqual([sofia.verifiedEmissions2025T, sofia.freeAllowances2025Eua], [53901, 49128]);
});

test('expanded profiles preserve every 2024 baseline without inventing model scores', () => {
  const baseline = Data.createDefaultCompanies();
  const roster = Data.createCompanyRoster();
  assert.equal(roster.length, 56);
  assert.equal(roster.filter(row => row.registry2025Provided).length, 52);
  assert.ok(!roster.some(row => row.id === 'svilosa'));
  baseline.forEach(old => {
    const current = roster.find(row => row.id === old.id);
    assert.equal(current.emissions2024Kt, old.emissions2024Kt, old.id);
    assert.equal(current.emissionsKt, old.emissionsKt, old.id);
    assert.deepEqual(current.factors, old.factors, old.id);
  });
  assert.equal(roster.filter(row => !row.modelAssessed).length, 33);
  assert.ok(roster.filter(row => !row.modelAssessed).every(row => row.factors === undefined && row.emissions2024Kt === undefined));
  assert.ok(roster.filter(row => row.registry2025Provided).every(row => /[А-Яа-я]/.test(row.companyBg) && row.mainActivity.en && row.mainActivity.bg && row.registryInstallation.bg));
});

test('all new operators appear on the geography, with 2025 sums independent of historical emissions', () => {
  const mapped = Geography.getCompanies(2025);
  assert.equal(mapped.length, 53);
  assert.equal(mapped.filter(row => row.registry2025Provided).length, 52);
  assert.ok(Math.abs(Geography.sumEmissions(mapped) - 6486.088) < 1e-8);
  assert.ok(Math.abs(Geography.sumEmissions(Geography.getCompanies(2024)) - 6462.515) < 1e-8);
  const validRegions = new Set(Data.STATISTICAL_REGIONS.map(region => region.id));
  mapped.forEach(row => {
    assert.ok(validRegions.has(row.geography.regionId), row.id);
    assert.ok(row.geography.latitude > 41 && row.geography.latitude < 45, row.id);
    assert.ok(row.geography.longitude > 22 && row.geography.longitude < 29, row.id);
  });
  const model = Geography.bubbleModel(mapped, 'activity', undefined, { includeContext: false });
  assert.equal(model.groups.reduce((sum, group) => sum + group.count, 0), 53);
  assert.equal(model.positions.size, 53);
  assert.ok(model.groups.some(group => group.key === 'ceramics' && group.count === 15));
  assert.equal(model.groups.find(group => group.key === 'supplemental-amylum').emissionsText, 'Not available');
  const mixed = Geography.bubbleModel(mapped, 'region', undefined, { includeContext: true });
  assert.ok(Math.abs(mixed.groups.reduce((sum, group) => sum + group.emissionsKt, 0) - 6486.088) < 1e-8, '2024 energy context must not enter 2025 regional totals');
  assert.equal(mixed.groups.reduce((sum, group) => sum + group.contextCount, 0), 28);
  assert.equal(mapped.find(row => row.id === 'keraminzhenering').geography.locality, 'Bagrentsi');
  assert.equal(mapped.find(row => row.id === 'sma-mineral').geography.regionId, 'BG34');
  const traces = Geography.mapTraces(mapped).filter(trace => trace.meta?.layer === 'analysis');
  assert.equal(traces.reduce((sum, trace) => sum + trace.x.length, 0), 53);
  const unknown = traces.flatMap(trace => trace.marker.symbol).filter(symbol => symbol === 'circle-open');
  assert.equal(unknown.length, 7); // six empty 2025 cells plus the retained Amylum profile
});
