"""
Final pre-hackathon end-to-end test: plays the browser's role over WebSocket
and exercises every guided flow, cross-screen navigation and flow ending.

Run:  python test_flows.py
"""
import asyncio
import json
import sys

import websockets

import agent


async def drain(ws, seconds=0.4):
    """Collect any messages waiting on the socket."""
    messages = []
    try:
        while True:
            data = await asyncio.wait_for(ws.recv(), timeout=seconds)
            messages.append(json.loads(data))
    except asyncio.TimeoutError:
        pass
    return messages


async def expect(ws, label, want_type="AGENT_HIGHLIGHT", want_target=None, want_guidance=False):
    """Read one message and check type/target; returns the message."""
    try:
        data = json.loads(await asyncio.wait_for(ws.recv(), timeout=5))
    except asyncio.TimeoutError:
        print(f"  FAIL {label}: no message arrived")
        return None
    ok = data.get("type") == want_type
    if ok and want_target is not None:
        ids = data.get("targetIds") or [data.get("targetId")]
        ok = want_target in ids
    if ok and want_guidance:
        ok = bool(data.get("flowGuidance"))
    status = "PASS" if ok else "FAIL"
    detail = data.get("targetIds", data.get("targetId", ""))
    guidance = " +guidance" if data.get("flowGuidance") else ""
    print(f"  {status} {label}: {detail}{guidance}")
    return data if ok else None


async def main():
    failures = 0
    async with websockets.serve(agent.handler, "localhost", 8766):
        print("flow-test server on ws://localhost:8766")
        async with websockets.connect("ws://localhost:8766") as ws:
            # -- 1. check balance on home --------------------------------
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "home-screen"}))
            await asyncio.sleep(0.2)
            await agent.handle_utterance("mera balance kitna hai")
            m = await expect(ws, "balance on home", want_target="home-balance-amount")
            failures += m is None

            # -- 2. cross-screen: pay bill from sendmoney-screen ----------
            print("\n[cross-screen navigation]")
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "sendmoney-screen"}))
            await asyncio.sleep(0.2)
            await agent.handle_utterance("I want to pay my electricity bill")
            m = await expect(ws, "pay_bill from sendmoney -> bills nav",
                             want_target="side-nav-bills", want_guidance=True)
            failures += m is None
            print(f"  (last_intent kept: {agent.last_intent})")
            failures += agent.last_intent != "pay_bill"

            # -- 3. auto-guide fires when user reaches paybill-screen ------
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "paybill-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "auto-guide step 1 on paybill",
                             want_target="paybill-biller-select", want_guidance=True)
            failures += m is None

            # -- 4. next walks the flow -----------------------------------
            await agent.handle_utterance("next")
            m = await expect(ws, "step 2 amount", want_target="paybill-amount-input", want_guidance=True)
            failures += m is None

            # -- 5. flow end: success screen highlights home button --------
            print("\n[flow end]")
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "paybill-success-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "success home + completion speech",
                             want_target="paybill-success-home", want_guidance=True)
            failures += m is None
            failures += agent.last_intent is not None
            print(f"  (last_intent cleared: {agent.last_intent is None})")

            # -- 6. new intents: keyword classification --------------------
            print("\n[new intent classification]")
            for phrase, intent in [
                ("I need a balance certificate", "request_certificate"),
                ("مجھے سرٹیفکیٹ چاہیے", "request_certificate"),
                ("order a cheque book", "request_cheque_book"),
                ("چیک بک منگوانی ہے", "request_cheque_book"),
                ("stop cheque number 1234", "stop_cheque"),
                ("چیک روکنا ہے", "stop_cheque"),
                ("freeze my card", "manage_card"),
                ("کارڈ منجمد کرو", "manage_card"),
                ("scan a QR code", "qr_pay"),
            ]:
                result = agent.fallback_classify(phrase)
                ok = result["intent"] == intent
                failures += not ok
                mark = "PASS" if ok else f"FAIL (got {result['intent']})"
                print(f"  {mark} '{phrase}' -> {intent}")

            # -- 7. qr-pay flow: scan screen -> confirm screen -------------
            print("\n[qr-pay internal-state screens]")
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "home-screen"}))
            await asyncio.sleep(0.1)
            await agent.handle_utterance("scan a QR code")
            m = await expect(ws, "qr from home -> quick action",
                             want_target="home-quick-action-qr", want_guidance=True)
            failures += m is None

            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "qr-pay-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "qr auto-guide scan step",
                             want_target="qrpay-simulate-scan", want_guidance=True)
            failures += m is None

            # confirm screen broadcasts as its own screen id
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "qrpay-confirm-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "qr confirm auto-guide amount",
                             want_target="qrpay-amount-input", want_guidance=True)
            failures += m is None

            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "qrpay-success-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "qr success end",
                             want_target="qrpay-success-home", want_guidance=True)
            failures += m is None

            # -- 8. cheque flow with tab step ------------------------------
            print("\n[cheque-book flow with tab step]")
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "home-screen"}))
            await asyncio.sleep(0.1)
            await agent.handle_utterance("order a cheque book")
            m = await expect(ws, "cheque from home -> nav",
                             want_target="side-nav-cheque-book", want_guidance=True)
            failures += m is None

            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "cheque-book-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "cheque auto-guide tab step",
                             want_target="cheque-tab-request", want_guidance=True)
            failures += m is None

            # -- 9. stop_cheque flow from cheque screen --------------------
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "home-screen"}))
            await asyncio.sleep(0.1)
            await agent.handle_utterance("stop cheque")
            m = await expect(ws, "stop_cheque nav guidance",
                             want_target="side-nav-cheque-book", want_guidance=True)
            failures += m is None

            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "cheque-book-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "stop_cheque auto-guide stop tab",
                             want_target="cheque-tab-stop", want_guidance=True)
            failures += m is None

            # -- 10. manage_card two-screen flow ---------------------------
            print("\n[manage_card two-screen flow]")
            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "home-screen"}))
            await asyncio.sleep(0.1)
            await agent.handle_utterance("freeze my card")
            m = await expect(ws, "manage_card from home -> cards nav",
                             want_target="nav-cards", want_guidance=True)
            failures += m is None

            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "cards-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "cards auto-guide open card",
                             want_target="cards-open-card-debit-visa", want_guidance=True)
            failures += m is None

            await ws.send(json.dumps({"type": "AGENT_SCREEN_CHANGE", "screen": "card-detail-screen"}))
            await asyncio.sleep(0.2)
            m = await expect(ws, "card-detail auto-guide freeze",
                             want_target="cards-freeze-toggle", want_guidance=True)
            failures += m is None

    print("\n" + ("ALL FLOW TESTS PASSED" if failures == 0 else f"{failures} FAILURES"))
    return failures


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
