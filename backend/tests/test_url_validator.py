from app.services.scanner.url_validator import analyze_url, levenshtein_distance

def test_levenshtein_distance():
    assert levenshtein_distance("google", "g00gle") == 2
    assert levenshtein_distance("paypal", "paypa1") == 1
    assert levenshtein_distance("apple", "apple") == 0

def test_analyze_url_https():
    res = analyze_url("https://google.com")
    assert res["is_https"] is True
    assert res["is_ip"] is False
    assert res["status"] in ["Safe", "Suspicious"]

def test_analyze_url_typosquatting():
    res = analyze_url("http://g00gle.com")
    assert res["is_https"] is False
    assert res["typosquatting_detected"] is True
    assert res["target_brand_mimicked"] == "google"
    assert res["status"] == "Dangerous"

def test_analyze_url_ip():
    res = analyze_url("http://192.168.1.1/login")
    assert res["is_ip"] is True
    assert "URL uses a raw IP address" in str(res["flags"])
