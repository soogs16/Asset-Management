
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRCodeInput({ onScan }) {
  const [showScanner, setShowScanner] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          setResult(decodedText);
          setError("");

          onScan(decodedText);

          await scanner.stop();
          setShowScanner(false);
        },
        () => {
        }
      )
      .catch(() => {
        setError("Unable to access the camera.");
        setShowScanner(false);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, [showScanner, onScan]);
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setResult("");


    if (!file.type.startsWith("image/")) {
      setError("Please upload an image containing a QR code.");
      return;
    }

    const scanner = new Html5Qrcode("qr-image-reader");

    try {
      const decodedText = await scanner.scanFile(file, true);

      setResult(decodedText);
      onScan(decodedText);
      setError("");
    } catch (err) {
      setError("No QR code was detected in that image.");
    } finally {
      scanner.clear().catch(() => {});
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <label
          htmlFor="qr-upload"
          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          🖼️ Upload QR
        </label>

        <input
          id="qr-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => {
            setError("");
            setResult("");
            setShowScanner(true);
          }}
          className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          📷 Scan QR
        </button>
      </div>
      {showScanner && (
        <div className="rounded-xl border border-gray-300 bg-white p-3">
          <div id="qr-reader" className="w-full" />

          <button
            type="button"
            onClick={() => setShowScanner(false)}
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
      <div id="qr-image-reader" className="hidden" />

      {/* Success */}
      {result && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <p className="font-medium">✓ QR Code detected</p>
          <p className="mt-1 break-all">{result}</p>
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          ✕ {error}
        </div>
      )}
    </div>
  );
}

export default QRCodeInput;

