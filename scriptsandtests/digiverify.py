# *-* coding: utf-8 *-*
from endesive import pdf

'''alter table user_course add 
column is_course_completed boolean 
default 0;''''

def main():
    trusted_cert_pems = (
        # certum chain
        open('private.pem', 'rt').read(), )
    fname = 'digitest-signed-cms.pdf'
    print('*' * 20, fname)
    try:
        data = open(fname, 'rb').read()
    except:
        print("DH")
    (hashok, signatureok, certok) = pdf.verify(data, trusted_cert_pems)
    print('signature ok?', signatureok)
    print('hash ok?', hashok)
    print('cert ok?', certok)


main()
