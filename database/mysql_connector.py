from __future__ import print_function
from datetime import datetime, date
import mysql.connector
from mysql.connector import Error
import string

table_names = []

def sqlToDisplay( str ):
	str = string.replace(str, "_", " ")
	str = string.capwords(str)
	str = string.replace(str, "P Nomenclature", "P.nomenclature")
	str = string.replace(str, "C Nomenclature", "C.nomenclature")
	str = string.replace(str, "Mrn", "MRN")
	str = string.replace(str, "Dob", "DOB")
	str = string.replace(str, "Id", "ID")
	str = string.replace(str, "Dna", "DNA")
	str = string.replace(str, "Pcr", "PCR")
	str = string.replace(str, "Mlpa", "MLPA")
	str = string.replace(str, "Se ", "SE ")
	str = string.replace(str, "Rna", "RNA")
	str = string.replace(str, "On", "ON")
	str = string.replace(str, "Hcn", "HCN")
	str = string.replace(str, "Vaf", "VAF")
	str = string.replace(str, "Panel Assay", "Panel/Assay")
	str = string.replace(str, "Wbc", "WBC")
	str = string.replace(str, "Pb Bm", "PB/BM")
	str = string.replace(str, "Cf", "cf")
	str = string.replace(str, "Uhn", "UHN")
	
	return str

def connect():
    try:
		cnx = mysql.connector.connect(user='root', password='password', host='localhost', database='resultdb')
		if cnx.is_connected():
			print('Connected to MySQL database')
			cursor = cnx.cursor()
			cursor.execute("SHOW TABLES")
			tables = [i[0] for i in cursor.fetchall()]
			for x in xrange(len(tables)):
				print(tables[x])
				cursor.execute("SHOW columns FROM " + tables[x])
				cols = cursor.fetchall()
				field_names = [i[0] for i in cols]
				for j in xrange(len(cols)):
					print(sqlToDisplay(field_names[j]))
					table_names.append(tables[x] + ":" + sqlToDisplay(field_names[j]))

    except Error as e:
		print(e)

    finally:
		cnx.close()
		cursor.close()
		print('Connection closed')

if __name__ == '__main__':
    connect()
