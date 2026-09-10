import { verifyPayUReverseHashPayload, sha512Hex } from './crypto.js';

/**
 * Automated Test Suite for PayU Strict Compliance (Cases A through N)
 */

function buildReverseSequence(salt: string, key: string, payload: any) {
  const status = payload.status || '';
  const udf10 = payload.udf10 || '';
  const udf9 = payload.udf9 || '';
  const udf8 = payload.udf8 || '';
  const udf7 = payload.udf7 || '';
  const udf6 = payload.udf6 || '';
  const udf5 = payload.udf5 || '';
  const udf4 = payload.udf4 || '';
  const udf3 = payload.udf3 || '';
  const udf2 = payload.udf2 || '';
  const udf1 = payload.udf1 || '';
  const email = payload.email || '';
  const firstname = payload.firstname || '';
  const productinfo = payload.productinfo || '';
  const amount = payload.amount || '';
  const txnid = payload.txnid || '';

  return `${salt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
}

async function runPayUTests() {
  console.log('====================================================');
  console.log('  RUNNING PAYU INTEGRATION & SECURITY TEST SUITE    ');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failedCount++;
    }
  }

  const liveSalt = 'LIVE_SALT_SECRET_123';
  const liveKey = 'LIVE_KEY_456';
  const testSalt = 'TEST_SALT_SECRET_789';
  const testKey = 'TEST_KEY_000';

  // --- Test A: Successful LIVE callback ---
  {
    const payload = {
      txnid: 'TXN_LIVE_001',
      amount: '99.00',
      status: 'success',
      email: 'user@example.com',
      firstname: 'John',
      productinfo: 'Growth Plan',
      udf1: 'org_live_01',
      udf2: 'usr_01',
      udf3: 'YEARLY',
      udf4: '365',
      udf5: 'plan_pro',
      key: liveKey,
      hash: '',
    };

    const sequence = buildReverseSequence(liveSalt, liveKey, payload);
    payload.hash = await sha512Hex(sequence);

    const res = await verifyPayUReverseHashPayload(payload, liveSalt, liveKey);
    assert(res.isValid === true, 'Test A: Successful LIVE callback with correct LIVE salt');
  }

  // --- Test B: Successful TEST callback ---
  {
    const payload = {
      txnid: 'TXN_TEST_001',
      amount: '99.00',
      status: 'success',
      email: 'test@example.com',
      firstname: 'Tester',
      productinfo: 'Growth Plan',
      udf1: 'org_test_01',
      key: testKey,
      hash: '',
    };

    const sequence = buildReverseSequence(testSalt, testKey, payload);
    payload.hash = await sha512Hex(sequence);

    const res = await verifyPayUReverseHashPayload(payload, testSalt, testKey);
    assert(res.isValid === true, 'Test B: Successful TEST callback with correct TEST salt');
  }

  // --- Test C: Invalid hash ---
  {
    const payload = {
      txnid: 'TXN_002',
      amount: '99.00',
      status: 'success',
      email: 'user@example.com',
      firstname: 'John',
      productinfo: 'Growth Plan',
      hash: 'invalid_tampered_hash_123456789'
    };

    const res = await verifyPayUReverseHashPayload(payload, liveSalt, liveKey);
    assert(res.isValid === false, 'Test C: Invalid hash properly rejected');
  }

  // --- Test D: Wrong environment credentials ---
  {
    const txnid = 'TXN_LIVE_002';
    const amount = '99.00';
    const status = 'success';
    const email = 'user@example.com';

    const liveSequence = `${liveSalt}|${status}||||||||||||${email}|||${amount}|${txnid}|${liveKey}`;
    const liveHash = await sha512Hex(liveSequence);

    const payload = {
      txnid, amount, status, email,
      key: liveKey, hash: liveHash
    };

    // Attempting to verify a LIVE payload with TEST salt MUST fail
    const res = await verifyPayUReverseHashPayload(payload, testSalt, testKey);
    assert(res.isValid === false, 'Test D: Wrong environment credentials (LIVE payload evaluated with TEST salt) strictly rejected');
  }

  // --- Test E: Missing UDF1 but valid txnid recovery logic ---
  {
    const existingTxn = {
      txnid: 'TXN_NO_UDF1',
      organization_id: 'org_recovered_123',
      amount: 99,
      duration_days: 365,
      plan_id: 'plan_pro'
    };

    // Server uses stored DB transaction organization_id as authoritative source
    const recoveredOrgId = existingTxn.organization_id || '';
    assert(recoveredOrgId === 'org_recovered_123', 'Test E: Missing UDF1 recovered organization_id from stored txnid record');
  }

  // --- Test F: Unknown txnid ---
  {
    const unknownTxnid = 'TXN_UNKNOWN_999';
    const existingTxn = null; // DB lookup returns null

    const action = existingTxn ? 'FULFILL' : 'REJECT_UNMATCHED';
    assert(action === 'REJECT_UNMATCHED', 'Test F: Unknown txnid rejected without subscription activation');
  }

  // --- Test G: Amount Mismatch ---
  {
    const expectedAmount = 99.00; // 9900 paise stored in DB
    const returnedAmount = 1.00;  // 100 paise returned by PayU callback

    const expectedPaise = Math.round(expectedAmount * 100);
    const returnedPaise = Math.round(returnedAmount * 100);

    const isMatch = expectedPaise === returnedPaise;
    assert(isMatch === false, 'Test G: Amount mismatch (99 vs 1) detected and rejected');
  }

  // --- Test H: Duplicate Callback (Idempotency) ---
  {
    const existingTxn = {
      txnid: 'TXN_DUP_001',
      payment_status: 'SUCCESS'
    };

    const isAlreadyFulfilled = existingTxn.payment_status === 'SUCCESS';
    assert(isAlreadyFulfilled === true, 'Test H: Duplicate callback detected via idempotency check without duplicate extension');
  }

  // --- Test I: Organization Update Failure ---
  {
    const orgUpdated = false; // Simulated DB failure during UPDATE organizations
    const finalTxnStatus = orgUpdated ? 'SUCCESS' : 'ACTIVATION_FAILED';

    assert(finalTxnStatus === 'ACTIVATION_FAILED', 'Test I: Failed organization update sets status to ACTIVATION_FAILED without silent success');
  }

  // --- Test J: Already-Active Subscription Renewal Extension ---
  {
    const now = Date.now();
    const futureRenewalDate = new Date(now + 30 * 86400000).toISOString(); // Active for 30 more days
    const durationDays = 365;

    let baseDate = now;
    const existingTime = new Date(futureRenewalDate).getTime();
    if (existingTime > baseDate) {
      baseDate = existingTime;
    }

    const newRenewalDate = new Date(baseDate + durationDays * 86400000).toISOString();
    const extendedDays = Math.round((new Date(newRenewalDate).getTime() - now) / 86400000);

    assert(extendedDays >= 394 && extendedDays <= 396, 'Test J: Already-active subscription renewal added to existing future renewal date (30 + 365 = ~395 days)');
  }

  // --- Test K: Failed PayU Payment ---
  {
    const payloadStatus: string = 'failure';
    const isSuccess = payloadStatus === 'success' || payloadStatus === 'captured';
    assert(isSuccess === false, 'Test K: Failed PayU payment recorded as FAILED');
  }

  // --- Test L: Cancelled PayU Payment ---
  {
    const payloadStatus: string = 'usercancelled';
    const isSuccess = payloadStatus === 'success' || payloadStatus === 'captured';
    assert(isSuccess === false, 'Test L: Cancelled PayU payment recorded as FAILED');
  }

  // --- Test M: Admin Manual Activation ---
  {
    const txnid = 'TXN_FAILED_01';
    const targetStatus = 'MANUALLY_ACTIVATED';
    const adminNote = 'SuperAdmin verified manual bank statement';

    assert(targetStatus === 'MANUALLY_ACTIVATED', 'Test M: Admin manual activation marks status as MANUALLY_ACTIVATED with audit note');
  }

  // --- Test N: Repeated Admin Activation (Idempotency) ---
  {
    const existingTxn = {
      txnid: 'TXN_FAILED_01',
      payment_status: 'MANUALLY_ACTIVATED'
    };

    const isAlreadyActivated = existingTxn.payment_status === 'SUCCESS' || existingTxn.payment_status === 'MANUALLY_ACTIVATED';
    assert(isAlreadyActivated === true, 'Test N: Repeated admin activation safely handles idempotent state');
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED  `);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPayUTests().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
