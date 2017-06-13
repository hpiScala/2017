# Introductoin to the Marmolata Data framework

--
## Overview

- Marmolata.Data provides 
  - functionality for consuming data from various sources  in a uniform way
    - both in frontend and backend code (Scala and Scala.js)
  - embedded query languages (SQL, CDS, etc.)
  - tools for utilizing metadata (like ABAP DDIC, HANA data base artifacts)

---
## Embedded SQL
- Compile-time checks allow early detection of query errors
- Misspelled columns/referencing a non-existing column

```scala
val query = sql"""select NAME1, FOO FROM KNA1 LIMIT 10"""

[error] ...\Sandbox.scala:25: value FOO is not a member of object com.sap.marmolata.erp.KNA1
[error]   val query = sql"""select NAME1, FOO FROM KNA1 LIMIT 10"""
[error]               ^
[error] one error found

```

- Incompatible type (column KUNNR is of type string)

```scala
val query = sql"""select NAME1  FROM KNA1 WHERE KUNNR=5 LIMIT 10"""

[error] ...Sandbox.scala:25: inferred type arguments [com.sap.marmolata.data.query.typed.Expression{type ColumnSet = com.sap.marmolata.erp.KNA1.KUNNR_Accessor; type ReturnType = com.sap.marmolata.data.types.DString; type MetadataType = com.sap.marmolata.erp.schema.ERPMetadata with com.sap.marmolata.data.schema.HasInitialValue[com.sap.marmolata.data.types.DString]},com.sap.marmolata.data.query.typed.Expression.OfConstant[com.sap.marmolata.data.types.DCurrencyValue]] do not conform to method equal's type parameter bounds [Lhs <: com.sap.marmolata.data.query.typed.Expression,Rhs <: com.sap.marmolata.data.query.typed.Expression{type ReturnType <: Lhs#ReturnType}]
[error]   val query = sql"""select NAME1  FROM KNA1 WHERE KUNNR=5 LIMIT 10"""
[error]               ^
[error] one error found
[error](dataSandbox/compile:compileIncremental) Compilation failed

```

---
## Composability

- Queries are composable - i.e. it is possible to build more complex queries out of simpler ones

```scala

val query = sql"select KUNNR FROM KNA1 WHERE LAND1='US'"
val composed = sql"select max(KUNNR) from $query"

```

---
## Typed result sets

Upon executing queries it is possible to process in a typed way

```scala
  
val query = sql"select KUNNR FROM KNA1 LIMIT 10"
val result = query.execute
println(result.map(
  row => row.KUNNR.value
).mkString(", "))

```
