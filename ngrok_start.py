from pyngrok import conf, ngrok

conf.get_default().auth_token = "3EOcPPut4qHD2ZfVzoolUrz6gfu_69ZhLjtgNV6rmd1CXtLCX"
t = ngrok.connect(8000, domain="rotunda-gibberish-brute.ngrok-free.dev")
print("URL:", t.public_url)
input("Nhan Enter de dung ngrok...")
