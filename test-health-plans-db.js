const { MongoClient } = require('mongodb')

async function testHealthPlansDB() {
  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set')
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db('health_crm')
    const healthPlansCollection = db.collection('healthplans')

    // Check if collection exists
    const collections = await db.listCollections().toArray()
    console.log('Available collections:', collections.map(c => c.name))

    // Count all documents
    const totalCount = await healthPlansCollection.countDocuments()
    console.log(`Total documents in healthplans collection: ${totalCount}`)

    // Count active documents
    const activeCount = await healthPlansCollection.countDocuments({ isActive: true })
    console.log(`Active documents (isActive: true): ${activeCount}`)

    // Count inactive documents
    const inactiveCount = await healthPlansCollection.countDocuments({ isActive: false })
    console.log(`Inactive documents (isActive: false): ${inactiveCount}`)

    // Count documents without isActive field
    const noIsActiveCount = await healthPlansCollection.countDocuments({ isActive: { $exists: false } })
    console.log(`Documents without isActive field: ${noIsActiveCount}`)

    // Get all documents to examine structure
    const allDocs = await healthPlansCollection.find({}).toArray()
    console.log('\n=== ALL DOCUMENTS ===')
    
    allDocs.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`)
      console.log('_id:', doc._id)
      console.log('planId:', doc.planId)
      console.log('title:', doc.title)
      console.log('customerId:', doc.customerId)
      console.log('isActive:', doc.isActive)
      console.log('status:', doc.status)
      console.log('createdAt:', doc.createdAt)
      console.log('updatedAt:', doc.updatedAt)
      console.log('Has products:', Array.isArray(doc.products) ? doc.products.length : 'No products field')
      console.log('Has productRecommendations:', Array.isArray(doc.productRecommendations) ? doc.productRecommendations.length : 'No productRecommendations field')
      console.log('Tags:', doc.tags)
      
      // Show first few keys to understand structure
      console.log('Document keys:', Object.keys(doc).slice(0, 10))
    })

    // Test the exact query used by the API
    console.log('\n=== TESTING API QUERY ===')
    const apiQuery = { isActive: true }
    const apiResults = await healthPlansCollection.find(apiQuery).toArray()
    console.log(`API query { isActive: true } returned ${apiResults.length} documents`)

    // Test without isActive filter
    console.log('\n=== TESTING WITHOUT isActive FILTER ===')
    const allResults = await healthPlansCollection.find({}).toArray()
    console.log(`Query without isActive filter returned ${allResults.length} documents`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
    console.log('\nConnection closed')
  }
}

testHealthPlansDB()