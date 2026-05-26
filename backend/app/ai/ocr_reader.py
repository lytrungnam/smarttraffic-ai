import cv2
import re
import easyocr

# =====================================
# EASY OCR
# =====================================

reader = easyocr.Reader(
    ["en"],
    gpu=False,
)

# =====================================
# VIETNAM PROVINCE CODES
# =====================================

PROVINCE_CODES = {

    "11": "Cao Bang",
    "12": "Lang Son",
    "14": "Quang Ninh",
    "15": "Hai Phong",
    "17": "Thai Binh",
    "18": "Nam Dinh",
    "19": "Phu Tho",
    "20": "Thai Nguyen",
    "21": "Yen Bai",
    "22": "Tuyen Quang",
    "23": "Ha Giang",
    "24": "Lao Cai",
    "25": "Lai Chau",
    "26": "Son La",
    "27": "Dien Bien",
    "28": "Hoa Binh",

    "29": "Ha Noi",
    "30": "Ha Noi",
    "31": "Ha Noi",
    "32": "Ha Noi",
    "33": "Ha Noi",
    "40": "Ha Noi",

    "34": "Hai Duong",
    "35": "Ninh Binh",
    "36": "Thanh Hoa",
    "37": "Nghe An",
    "38": "Ha Tinh",

    "43": "Da Nang",

    "47": "Dak Lak",
    "48": "Dak Nong",
    "49": "Lam Dong",

    "50": "Ho Chi Minh",
    "51": "Ho Chi Minh",
    "52": "Ho Chi Minh",
    "53": "Ho Chi Minh",
    "54": "Ho Chi Minh",
    "55": "Ho Chi Minh",
    "56": "Ho Chi Minh",
    "57": "Ho Chi Minh",
    "58": "Ho Chi Minh",
    "59": "Ho Chi Minh",

    "60": "Dong Nai",
    "61": "Binh Duong",
    "62": "Long An",
    "63": "Tien Giang",
    "64": "Vinh Long",
    "65": "Can Tho",
    "66": "Dong Thap",
    "67": "An Giang",
    "68": "Kien Giang",
    "69": "Ca Mau",

    "70": "Tay Ninh",
    "71": "Ben Tre",
    "72": "Ba Ria Vung Tau",

    "73": "Quang Binh",
    "74": "Quang Tri",
    "75": "Hue",
    "76": "Quang Ngai",
    "77": "Binh Dinh",
    "78": "Phu Yen",
    "79": "Ho Chi Minh",

    "81": "Gia Lai",
    "82": "Kon Tum",
    "83": "Soc Trang",
    "84": "Tra Vinh",
    "85": "Ninh Thuan",
    "86": "Binh Thuan",

    "88": "Vinh Phuc",
    "89": "Hung Yen",
    "90": "Ha Nam",

    "92": "Quang Nam",
    "93": "Binh Phuoc",
    "94": "Bac Lieu",
    "95": "Hau Giang",

    "97": "Bac Kan",
    "98": "Bac Giang",
    "99": "Bac Ninh",
}

# =====================================
# NORMALIZE OCR TEXT
# =====================================

def normalize_plate(text):

    text = text.upper()

    # remove symbols
    text = re.sub(
        r"[^A-Z0-9]",
        "",
        text,
    )

    # common OCR mistakes
    text = text.replace("O", "0")
    text = text.replace("I", "1")
    text = text.replace("Z", "2")
    text = text.replace("S", "5")
    text = text.replace("B", "8")

    return text


# =====================================
# FORMAT VN PLATE
# =====================================

def format_vn_plate(text):

    if len(text) == 8:

        # 43A12345
        # -> 43A-123.45

        return (
            f"{text[:3]}-"
            f"{text[3:6]}."
            f"{text[6:]}"
        )

    return text


# =====================================
# OCR MAIN FUNCTION
# =====================================

def read_plate_text(plate_image):

    try:

        # resize larger
        plate_image = cv2.resize(
            plate_image,
            None,
            fx=4,
            fy=4,
        )

        # grayscale
        gray = cv2.cvtColor(
            plate_image,
            cv2.COLOR_BGR2GRAY,
        )

        # blur
        gray = cv2.GaussianBlur(
            gray,
            (3, 3),
            0,
        )

        # threshold
        _, thresh = cv2.threshold(
            gray,
            120,
            255,
            cv2.THRESH_BINARY,
        )

        # OCR
        results = reader.readtext(
            thresh
        )

        if not results:
            return "UNKNOWN"

        best_text = "UNKNOWN"

        best_conf = 0

        for result in results:

            text = result[1]

            confidence = result[2]

            cleaned_text = normalize_plate(
                text
            )

            # simple filters
            if (

                confidence > 0.5

                and confidence > best_conf

                and len(cleaned_text) >= 6
            ):

                best_text = cleaned_text

                best_conf = confidence

        # format vietnam plate
        if best_text != "UNKNOWN":

            best_text = format_vn_plate(
                best_text
            )

        return best_text

    except Exception:

        return "UNKNOWN"